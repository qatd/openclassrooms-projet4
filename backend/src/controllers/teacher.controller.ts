import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { HttpError } from '../errors/http-error';
import { TeacherRepository } from '../repositories/teacher.repository';

const teacherRepository = new TeacherRepository();

export class TeacherController {
  async getAll(req: AuthRequest, res: Response) {
    const teachers = await teacherRepository.findAll();

    const response: any = teachers.map((teacher: any) => ({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    }));

    return res.status(200).json(response);
  }

  async getById(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };

    if (!id) {
      throw new HttpError(400, 'Teacher ID is required');
    }

    const teacherId = parseInt(id);

    if (isNaN(teacherId)) {
      throw new HttpError(400, 'Invalid teacher ID');
    }

    const teacher = await teacherRepository.findById(teacherId);

    if (!teacher) {
      throw new HttpError(404, 'Teacher not found');
    }

    const response: any = {
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    };

    return res.status(200).json(response);
  }
}
