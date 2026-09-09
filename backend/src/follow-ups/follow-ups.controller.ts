import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { FollowUpsService } from './follow-ups.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FollowUpCategory } from '@prisma/client';

@Controller('follow-ups')
export class FollowUpsController {
  constructor(private readonly followUpsService: FollowUpsService) {}

  @Post('schedule')
  @UseGuards(JwtAuthGuard)
  async createSchedule(
    @Request() req: any,
    @Body() body: { patientId: string; category: FollowUpCategory; startDate?: Date },
  ) {
    const workerId = req.user?.id;
    return this.followUpsService.createSchedule({
      patientId: body.patientId,
      workerId,
      category: body.category,
      startDate: body.startDate,
    });
  }

  @Get('tasks')
  @UseGuards(JwtAuthGuard)
  async getTasks(
    @Request() req: any,
    @Query('completed') completed?: string,
  ) {
    const workerId = req.user?.role === 'FRONTLINE_WORKER' ? req.user.id : undefined;
    return this.followUpsService.getTasks(workerId, completed === 'true');
  }

  @Post('tasks/:id/complete')
  @UseGuards(JwtAuthGuard)
  async completeTask(
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ) {
    return this.followUpsService.completeTask(id, notes);
  }

  @Get('patient/:patientId')
  @UseGuards(JwtAuthGuard)
  async getPatientTasks(@Param('patientId') patientId: string) {
    return this.followUpsService.getPatientFollowUps(patientId);
  }
}
