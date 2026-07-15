import { apiClient } from './axiosConfig';

export interface Statistics {
  subjects_total?: number;
  topics_total?: number;
  teachers_total?: number;
  students_total?: number;
  classroom_students_total?: number;
  users_total?: number;
  managers_total?: number;
  class_students_total?: number;
  subject_exams_total?: number;
  exam_questions_total?: number;
  question_options_total?: number;
  question_answers_total?: number;
  exam_attempts_total?: number;
  class_rooms_total?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const statisticsService = {
  /**
   * Get statistics for specified entities
   * @param entities - Array of entity types to get statistics for
   * @returns Object with count statistics for each requested entity
   */
  async getStatistics(entities: string[]): Promise<Statistics> {
    const entitiesParam = entities.join(',');
    const response = await apiClient.get<ApiResponse<Statistics>>(
      `/statistics?entities=${entitiesParam}`
    );
    return response.data.data;
  },
};

export default statisticsService;