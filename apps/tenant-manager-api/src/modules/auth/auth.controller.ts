import { Body, Controller, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser, AuthenticatedUser } from "../../common/decorators/current-user.decorator";

const REFRESH_COOKIE = "ssa_refresh_token";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/v1/auth",
};

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(dto.email, dto.password);
    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
    return { accessToken };
  }

  @Public()
  @Post("refresh")
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) throw new UnauthorizedException("Sessão não encontrada");

    const tokens = await this.authService.refresh(refreshToken);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    return { accessToken: tokens.accessToken };
  }

  @Post("logout")
  async logout(@CurrentUser() user: AuthenticatedUser, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(user.id);
    res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTIONS);
    return { success: true };
  }

  @Post("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
