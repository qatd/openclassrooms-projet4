import { Teacher } from '@prisma/client';
import { HttpError } from '../errors/http-error';
import { TeacherRepository } from '../repositories/teacher.repository';

const teacherRepository = new TeacherRepository();

// Response sent to the client: the list of exposed fields is explicit
const toTeacherResponse = (teacher: Teacher) => ({
  id: teacher.id,
  firstName: teacher.firstName,
  lastName: teacher.lastName,
  createdAt: teacher.createdAt,
  updatedAt: teacher.updatedAt,
});

export class TeacherService {
  async findAll() {
    const teachers = await teacherRepository.findAll();
    return teachers.map(toTeacherResponse);
  }

  async findById(id: number) {
    const teacher = await teacherRepository.findById(id);

    if (!teacher) {
      throw new HttpError(404, 'Teacher not found');
    }

    return toTeacherResponse(teacher);
  }
}
