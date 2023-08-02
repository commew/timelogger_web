import {
  getAppApiUrl,
  getDynamicAppApiUrl,
  httpStatusCode,
  InvalidResponseBodyError,
  isTask,
  UnexpectedFeatureError,
} from '@/features';
import type { CreateTask, StopTask, Task } from '@/features';
import { type operations } from '@/openapi/schema';

export const createTask: CreateTask = async (dto) => {
  const { taskCategoryId, status, startAt } = dto;

  const requestBody: operations['postTasks']['requestBody'] = {
    content: {
      'application/json': {
        taskCategoryId,
        status,
        startAt,
      },
    },
  };

  const response = await fetch(getAppApiUrl('tasks'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody.content['application/json']),
  });

  if (response.status !== httpStatusCode.created) {
    throw new UnexpectedFeatureError(
      `failed to createTask. status: ${
        response.status
      }, body: ${await response.text()}`
    );
  }

  const task = (await response.json()) as Task;
  if (!isTask(task)) {
    throw new InvalidResponseBodyError(
      `responseBody is not in the expected format. body: ${JSON.stringify(
        task
      )}`
    );
  }

  return task;
};

export const stopTask: StopTask = async (dto) => {
  const { taskId } = dto;

  const response = await fetch(getDynamicAppApiUrl('stopTask', `${taskId}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== httpStatusCode.ok) {
    throw new UnexpectedFeatureError(
      `failed to stopTask. status: ${
        response.status
      }, body: ${await response.text()}`
    );
  }

  const task = (await response.json()) as Task;
  if (!isTask(task)) {
    throw new InvalidResponseBodyError(
      `responseBody is not in the expected format. body: ${JSON.stringify(
        task
      )}`
    );
  }

  return task;
};
