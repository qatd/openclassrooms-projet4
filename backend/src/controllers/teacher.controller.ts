import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { TeacherService } from '../services/teacher.service';
import { parseId } from '../utils/parse-id';

const teacherService = new TeacherService();

export class TeacherController {
  async getAll(req: AuthRequest, res: Response) {
    const teachers = await teacherService.findAll();

    return res.status(200).json(teachers);
  }

  async getById(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };

    const teacher = await teacherService.findById(parseId(id, 'Teacher'));

    return res.status(200).json(teacher);
  }
}
