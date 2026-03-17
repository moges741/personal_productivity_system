import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Public = () => SetMetadata('isPublic', true);

// Custom decorator to extract user information 
export const GetUser = createParamDecorator(
  (data: keyof any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);