import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatbotService } from './chatbot.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateFAQDto } from './dto/create-faq.dto';
import { UpdateFAQDto } from './dto/update-faq.dto';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatbotService: ChatbotService,
  ) {}

  // ─── CONVERSACIONES ──────────────────────────────────────────────────────

  // POST /chat/conversations — Crear conversación (Admin asigna coach)
  @Post('conversations')
  @ApiOperation({
    summary: 'Crear conversación asignando coach a usuario (Admin)',
  })
  createConversation(@Body() dto: CreateConversationDto) {
    return this.chatService.createConversation(dto);
  }

  // GET /chat/conversations/user/:userId — Listar conversaciones del usuario
  @Get('conversations/user/:userId')
  @ApiOperation({ summary: 'Listar conversaciones de un usuario' })
  getUserConversations(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.chatService.getUserConversations(userId);
  }

  // GET /chat/conversations/coach/:coachId — Listar conversaciones del coach
  @Get('conversations/coach/:coachId')
  @ApiOperation({ summary: 'Listar conversaciones asignadas a un coach' })
  getCoachConversations(@Param('coachId', ParseUUIDPipe) coachId: string) {
    return this.chatService.getCoachConversations(coachId);
  }

  // GET /chat/conversations/:id/messages — Obtener mensajes de una conversación
  // Nota: en producción deberías sacar el userId del token JWT, no del query param
  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Obtener todos los mensajes de una conversación' })
  getMessages(
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Req() req: any, // Aquí deberías usar el userId del JWT
  ) {
    // TEMPORAL: asume que el userId viene en la query (?userId=xxx)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = req.query.userId as string;
    return this.chatService.getConversationMessages(conversationId, userId);
  }

  // PATCH /chat/conversations/:id/close — Cerrar conversación
  @Patch('conversations/:id/close')
  @ApiOperation({ summary: 'Cerrar una conversación' })
  closeConversation(@Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.closeConversation(id);
  }

  // ─── CHATBOT FAQs (Admin) ────────────────────────────────────────────────

  // POST /chat/faqs — Crear respuesta automática
  @Post('faqs')
  @ApiOperation({ summary: 'Crear FAQ para el chatbot (Admin)' })
  createFAQ(@Body() dto: CreateFAQDto) {
    return this.chatbotService.createFAQ(dto);
  }

  // GET /chat/faqs — Listar todas las FAQs
  @Get('faqs')
  @ApiOperation({ summary: 'Listar todas las FAQs del chatbot' })
  getAllFAQs() {
    return this.chatbotService.findAllFAQs();
  }

  // PATCH /chat/faqs/:id — Actualizar FAQ
  @Patch('faqs/:id')
  @ApiOperation({ summary: 'Actualizar FAQ (Admin)' })
  updateFAQ(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFAQDto) {
    return this.chatbotService.updateFAQ(id, dto);
  }

  // DELETE /chat/faqs/:id — Eliminar FAQ
  @Delete('faqs/:id')
  @ApiOperation({ summary: 'Eliminar FAQ (Admin)' })
  deleteFAQ(@Param('id', ParseUUIDPipe) id: string) {
    return this.chatbotService.deleteFAQ(id);
  }

  // GET /chat/access/:userId — Verificar si el usuario tiene acceso al chat
  @Get('access/:userId')
  @ApiOperation({ summary: 'Verificar si el usuario puede usar el chat' })
  async checkAccess(@Param('userId', ParseUUIDPipe) userId: string) {
    const hasAccess = await this.chatService.canUserAccessChat(userId);
    return { userId, hasAccess };
  }
}
