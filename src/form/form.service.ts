import {
  BadGatewayException,
  BadRequestException,
  ConsoleLogger,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { Form } from './entities/form.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Manager } from '../admin/entities/manager.entity';
import { Community } from 'src/community/entities/community.entity';
import { ApplyType } from './types/form-apply-type.enum';
import { ApplyUser } from './entities/apply-user.entity';
import { FormQuestion } from './entities/form-question.entity';
import { PartialUser } from 'src/user/interfaces/partial-user.entity';

@Injectable()
export class FormService {
  constructor(
    @InjectRepository(Form)
    private readonly formRepository: Repository<Form>,
    @InjectRepository(ApplyUser)
    private readonly applyUserRepository: Repository<ApplyUser>,
    @InjectRepository(FormQuestion)
    private readonly formQuestionRepository: Repository<FormQuestion>,
    @InjectRepository(Manager)
    private readonly managerRepository: Repository<Manager>,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    private dataSource: DataSource,
  ) {}

  //폼 생성
  async create(createFormDto: CreateFormDto, user: PartialUser) {
    const {
      title,
      content,
      formType,
      maxApply,
      question,
      spareApply,
      startTime,
      endTime,
      communityId,
    } = createFormDto;
    const managerId = user?.roleInfo?.roleId;
    //커뮤니티 유효성 체크
    const community = await this.communityRepository.findOne({
      where: { communityId },
    });
    if (!community) {
      throw new NotFoundException('존재하지 않는 커뮤니티 입니다.');
    }

    //userId로 매니저 테이블의 정보를 가져와 해당 매니저 등록된 커뮤니티ID 와 입력한 커뮤니티 ID 값이 일치한지 확인
    const manager = await this.managerRepository.findOne({
      where: { managerId },
    });
    if (manager.communityId !== communityId) {
      throw new NotFoundException('해당 커뮤니티에 권한이 없는 매니저입니다.');
    }

    //중복 제목 체크
    const titleCheck = await this.formRepository.findOne({
      where: { title },
    });

    if (titleCheck) {
      throw new BadRequestException('이미 존재하는 제목입니다.');
    }

    //폼 db에 저장
    const createForm = await this.formRepository.save({
      title,
      content,
      formType,
      maxApply,
      spareApply,
      startTime,
      endTime,
      manager,
      community,
    });

    //질문 db에 저장
    await this.formQuestionRepository.save(
      question.map((question) => ({
        question,
        form: createForm,
      })),
    );

    // 저장된 질문 가져오기
    const applyQuestions = await this.formRepository.findOne({
      where: { id: createForm.id },
      relations: ['formQuestion'],
    });
    // 질문만 추출하기
    const questions = applyQuestions.formQuestion.map((questions) => ({
      question: questions.question,
    }));

    return {
      status: HttpStatus.CREATED,
      message: '폼 생성이 완료되었습니다',
      data: {
        formId: createForm.id,
        managerId: createForm.manager.managerId,
        communityId: createForm.community.communityId,
        title: createForm.title,
        content: createForm.content,
        questions,
        formType: createForm.formType,
        maxApply: createForm.maxApply,
        spareApply: createForm.spareApply,
        startTime: createForm.startTime,
        endTime: createForm.endTime,
        createdAt: createForm.createdAt,
        updatedAt: createForm.updatedAt,
      },
    };
  }

  //폼 상세 조회
  async findOne(formId: number) {
    //폼 유효성 체크

    const form = await this.formRepository.findOne({
      where: { id: formId },
      relations: ['formQuestion'],
    });

    if (!form) {
      throw new NotFoundException('폼이 존재하지 않습니다.');
    }

    //deletedAt 제외
    const { deletedAt, formQuestion, ...data } = form;
    //질문만추출
    const questions = form.formQuestion.map((questions) => ({
      question: questions.question,
    }));

    return {
      status: HttpStatus.OK,
      message: '폼 상세 조회에 성공하였습니다.',
      data: {
        id: data.id,
        title: data.title,
        content: data.content,
        maxApply: data.maxApply,
        spareApply: data.spareApply,
        endTime: data.endTime,
        questions,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    };
  }

  async update(
    formId: number,
    updateFormDto: UpdateFormDto,
    user: PartialUser,
  ) {
    const {
      title,
      content,
      formType,
      maxApply,
      addQuestion,
      deleteQuestionId,
      updateQuestionId,
      updateQuestion,
      spareApply,
      startTime,
      endTime,
    } = updateFormDto;
    const managerId = user?.roleInfo?.roleId;
    // 폼 유효성 체크
    const form = await this.formRepository.findOne({
      where: { id: formId },
      relations: ['manager', 'community'],
    });
    if (!form) {
      throw new NotFoundException('폼이 존재하지 않습니다.');
    }
    // form의 작성자와 수정 요청한 사용자가 일치한지 확인
    if (form.manager.managerId !== managerId) {
      throw new ForbiddenException('수정 권한이 없습니다.');
    }

    if (title !== undefined) {
      form.title = title;
    }
    if (content !== undefined) {
      form.content = content;
    }
    if (formType !== undefined) {
      form.formType = formType;
    }
    if (maxApply !== undefined) {
      form.maxApply = maxApply;
    }
    if (spareApply !== undefined) {
      form.spareApply = spareApply;
    }
    if (startTime !== undefined) {
      form.startTime = startTime;
    }
    if (endTime !== undefined) {
      form.endTime = endTime;
    }

    //form 변경사항 저장
    await this.formRepository.save(form);

    // 질문 추가 요청이 있을 경우
    if (addQuestion && addQuestion.length > 0) {
      for (let i = 0; i < addQuestion.length; i++) {
        await this.formQuestionRepository.save({
          form: form,
          question: addQuestion[i],
        });
      }
    }

    // 질문 삭제 요청이 있을 경우
    if (deleteQuestionId && deleteQuestionId.length > 0) {
      for (let i = 0; i < deleteQuestionId.length; i++) {
        const removeQuestionId = await this.formQuestionRepository.findOne({
          where: { id: deleteQuestionId[i], form: { id: form.id } }, //전달받은 questionId를 순서대로 조회 + 위에서 조회된 form.id 조회
        });
        if (!removeQuestionId) {
          throw new NotFoundException(`질문 ID가 존재하지 않습니다.`);
        }
        await this.formQuestionRepository.remove(removeQuestionId);
      }
    }

    // 질문 수정이 있을 경우
    // 질문 id 또는 질문이 입력되어 있다면 유효성 검사 => 데이터 변환 진행
    if (updateQuestionId !== undefined || updateQuestion !== undefined) {
      if (updateQuestionId.length !== updateQuestion.length) {
        throw new BadRequestException(
          '입력한 id와 수정할 내용의 수가 일치하지 않습니다',
        );
      }

      // 수가 동일하다면 입력한 질문 ID 삭제
      if (updateQuestionId.length > 0 && updateQuestion.length > 0) {
        for (let i = 0; i < updateQuestionId.length; i++) {
          const removeQuestionId = await this.formQuestionRepository.findOne({
            where: { id: updateQuestionId[i], form: { id: form.id } }, //전달받은 questionId를 순서대로 조회 + 위에서 조회된 form.id 조회
          });
          if (!removeQuestionId) {
            throw new NotFoundException(`질문 ID가 존재하지 않습니다.`);
          }
          await this.formQuestionRepository.remove(removeQuestionId);
        }
      }
      // 입력한 질문 새로 저장
      for (let i = 0; i < updateQuestion.length; i++) {
        await this.formQuestionRepository.save({
          form: form,
          question: updateQuestion[i],
        });
      }
    }

    // 새로 저장된 질문 데이터를 가져오기
    const applyQuestion = await this.formRepository.findOne({
      where: { id: form.id },
      relations: ['formQuestion'],
    });
    // 새로운 질문 id + 질문 추출하기
    const newQuestions = applyQuestion.formQuestion.map((questions) => ({
      questionId: questions.id,
      question: questions.question,
    }));

    return {
      status: HttpStatus.OK,
      message: '폼 수정 성공하였습니다.',
      data: {
        formId: form.id,
        formTitle: form.title,
        formContent: form.content,
        formType: form.formType,
        maxApply: form.maxApply,
        spareApply: form.spareApply,
        question: newQuestions,
        startTime: form.startTime,
        endTime: form.endTime,
      },
    };
  }

  async remove(formId: number, user: PartialUser) {
    // 폼 유효성 체크
    const form = await this.formRepository.findOne({
      where: { id: formId },
      relations: ['manager', 'community'],
    });
    if (!form) {
      throw new NotFoundException('폼이 존재하지 않습니다.');
    }
    const managerId = user?.roleInfo?.roleId;
    // form의 작성자와 삭제 요청한 사용자가 일치한지 확인
    if (form.manager.managerId !== managerId) {
      throw new ForbiddenException('수정 권한이 없습니다.');
    }

    await this.formRepository.softDelete(formId);

    return {
      status: HttpStatus.OK,
      message: '폼 삭제 성공하였습니다.',
      data: formId,
    };
  }

  async applyForm(user: PartialUser, formId: number) {
    //폼 유효성 검사
    const form = await this.formRepository.findOne({
      where: { id: formId },
      relations: ['applyUser'],
    });
    if (!form) {
      throw new BadRequestException('폼을 찾을 수 없습니다.');
    }

    const userId = user?.id;
    //중복 신청 검사
    const userCheck = await this.applyUserRepository.findOne({
      where: { userId },
    });
    // if (userCheck) {
    //   throw new BadRequestException('중복 신청은 불가능합니다');
    // }

    // 문자열을 date로 변환 후, 현재 시간이 시작 + 마감 시간이 아닐 경우 오류 반환
    const now = new Date();
    const startTime = new Date(form.startTime);
    const endTime = new Date(form.endTime);

    if (now < startTime || now > endTime) {
      throw new BadRequestException('신청 기간이 아닙니다.');
    }

    // 신청 인원 유효성 검사
    const nowTotalApply = form.applyUser.length + 1; // 현재 신청인원
    const totalApply = form.maxApply + form.spareApply; // 총 신청인원
    const maxApply = form.maxApply; // 1차 선착순 인원

    //현재 신청자가, 총 신청자 보다 많을 경우
    if (nowTotalApply > totalApply) {
      throw new BadRequestException('선착순 마감되었습니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      // 현재신청자가 1차 신청자 수보다 적거나 동일할 경우엔 pass로 저장
      let finishForm;
      if (nowTotalApply <= maxApply) {
        finishForm = await queryRunner.manager.save(ApplyUser, {
          userId,
          applyType: ApplyType.Pass,
          form,
        });
      } // 현재신청자가 총 신청인원보다 적거나 동일하고, 1차 신청인원보다 클 경우엔 예비로 저장
      else if (nowTotalApply <= totalApply && nowTotalApply > maxApply) {
        finishForm = await queryRunner.manager.save(ApplyUser, {
          userId,
          applyType: ApplyType.Spare,
          form,
        });
      }
      await queryRunner.commitTransaction();
      return {
        status: HttpStatus.OK,
        message: '신청이 완료되었습니다.',
        data: { formId, ApplyStatus: finishForm.applyType },
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
