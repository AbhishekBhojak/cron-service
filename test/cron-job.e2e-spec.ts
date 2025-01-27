const { CronJobService } = require('../services/cron-job.service');
const axios = require('axios');

jest.mock('axios');

// Mock dependencies
const mockDatabase = {
  logCronJobHistory: jest.fn(),
  updateCronJobStatus: jest.fn(),
};

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
};

describe('CronJobService', () => {
  let cronJobService;

  beforeEach(() => {
    cronJobService = new CronJobService(mockDatabase, mockLogger);
    jest.clearAllMocks();
  });

  describe('executeJob', () => {
    it('should execute the job successfully and log the result', async () => {
      const job = {
        id: 'test-job',
        name: 'Test Job',
        triggerUrl: 'https://example.com/api/trigger',
        schedule: '*/5 * * * *',
      };

      const responseData = { success: true };
      axios.post.mockResolvedValueOnce({ data: responseData });

      await cronJobService.executeJob(job);

      expect(axios.post).toHaveBeenCalledWith(
        job.triggerUrl,
        {
          id: job.id,
          name: job.name,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.TRIGGER_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      expect(mockLogger.log).toHaveBeenCalledWith(
        `Cron job ${job.name} executed successfully.`,
      );
      expect(mockDatabase.logCronJobHistory).toHaveBeenCalledWith(
        job.id,
        'success',
        responseData,
      );
      expect(mockDatabase.updateCronJobStatus).toHaveBeenCalledWith(
        job.id,
        false,
      );
    });

    it('should handle errors during job execution and log the error', async () => {
      const job = {
        id: 'test-job',
        name: 'Test Job',
        triggerUrl: 'https://example.com/api/trigger',
        schedule: '*/5 * * * *',
      };

      const errorMessage = 'Request failed';
      axios.post.mockRejectedValueOnce(new Error(errorMessage));

      await cronJobService.executeJob(job);

      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error executing cron job ${job.name}: ${errorMessage}`,
      );
      expect(mockDatabase.logCronJobHistory).toHaveBeenCalledWith(
        job.id,
        'failed',
        errorMessage,
      );
    });
  });

  describe('scheduleJob', () => {
    it('should schedule a cron job with the given schedule', () => {
      const job = {
        id: 'test-job',
        name: 'Test Job',
        triggerUrl: 'https://example.com/api/trigger',
        schedule: '*/5 * * * *',
      };

      const cronJob = cronJobService.scheduleJob(job);

      expect(cronJob).toBeDefined();
      expect(cronJob.running).toBe(true);
      expect(mockLogger.log).toHaveBeenCalledWith(
        `Scheduled cron job: ${job.name}`,
      );
    });
  });

  describe('validateCronExpression', () => {
    it('should return true for valid cron expressions', () => {
      const validCron = '*/5 * * * *';
      const result = cronJobService.validateCronExpression(validCron);
      expect(result).toBe(true);
    });

    it('should return false for invalid cron expressions', () => {
      const invalidCron = 'invalid-cron';
      const result = cronJobService.validateCronExpression(invalidCron);
      expect(result).toBe(false);
    });
  });
});
