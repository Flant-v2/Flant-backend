import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProgressTypes } from '../types/progress.types';

export class CreateOrderDto {}
