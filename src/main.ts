import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port =  3001;
app.enableCors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://personal-productivity-vercel.vercel.app',
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
});
  await app.listen(port);

}
bootstrap();
