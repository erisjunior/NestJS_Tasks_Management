import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { User } from '../auth/user.entity';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';

const mockTasksRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
});

const mockUser: User = {
  id: 'someId',
  password: 'somePassword',
  username: 'someUsername',
  tasks: [],
};

const mockTask: Task = {
  id: 'someId',
  title: 'someTaskTitle',
  description: 'someTaskDescription',
  user: mockUser,
  status: TaskStatus.OPEN,
};

describe('TasksService', () => {
  let tasksService: TasksService;
  let tasksRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useFactory: mockTasksRepository },
      ],
    }).compile();

    tasksService = module.get(TasksService);
    tasksRepository = module.get(TasksRepository);
  });

  describe('getTasks', () => {
    it('calls TasksRepository.getTasks and return the result', async () => {
      const mockTasks = [mockTask];
      tasksRepository.getTasks.mockResolvedValue(mockTasks);
      const result = await tasksService.getTasks(null, mockUser);
      expect(result).toEqual(mockTasks);
    });
  });

  describe('getTaskById', () => {
    it('calls TasksRepository.findOne and returns the result', async () => {
      tasksRepository.findOne.mockResolvedValue(mockTask);
      const result = await tasksService.getTaskById(mockTask.id, mockUser);
      expect(result).toEqual(mockTask);
    });

    it('calls TasksRepository.findOne and handles an error', async () => {
      tasksRepository.findOne.mockResolvedValue(null);
      expect(
        tasksService.getTaskById('unexistentId', mockUser)
      ).rejects.toThrow(NotFoundException);
    });
  });
});
