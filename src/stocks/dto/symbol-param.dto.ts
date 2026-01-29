import { IsString, Length } from 'class-validator';

export class SymbolParamDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Length(1, 20)
  symbol: string;
}
