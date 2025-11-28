import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, ROLES_KEY } from '../decorators/roles.decorator';

interface RequestWithUser {
  user?: {
    roles?: string[];
    role?: string;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user) {
      return false;
    }
    const userRoles = user.roles || (user.role ? [user.role] : []);
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
