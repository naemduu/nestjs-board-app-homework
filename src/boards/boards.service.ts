import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Board, BoardStatus } from '@prisma/client';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllBoards(user: User): Promise<Board[]> {
    const boards = await this.prisma.board.findMany({
      where: {
        id: user.id,
      },
    });
    return boards;
  }

  async createBoard(
    createBoardDto: CreateBoardDto,
    user: User,
  ): Promise<Board> {
    const { title, description } = createBoardDto;
    const board = await this.prisma.board.create({
      data: {
        title: title,
        description: description,
        status: BoardStatus.PUBLIC,
        user: {
          connect: user,
        },
      },
    });
    return board;
  }

  async getBoardById(id: number): Promise<Board> {
    const found = await this.prisma.board.findUnique({
      where: {
        id: id,
      },
    });
    if (!found) {
      throw new NotFoundException(`Can't find Board with id ${id}`);
    }

    return found;
  }

  async deleteBoard(id: number, user: User): Promise<void> {
    const result = await this.prisma.board.deleteMany({
      where: {
        id: id,
        user: user,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(`Can't find Board with id ${id}`);
    }
  }

  async updateBoardStatus(id: number, status: BoardStatus): Promise<Board> {
    const board = await this.prisma.board.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    });
    if (!board) {
      throw new NotFoundException(`Can't find Board with id ${id}`);
    }
    return board;
  }
}
