import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { StockPrice } from '@prisma/client';
import { SymbolParamDto } from './dto/symbol-param.dto';
import { StocksService } from './stocks.service';
import { StocksResponse } from './stocks.types';

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get(':symbol')
  getStocks(@Param() params: SymbolParamDto): Promise<StocksResponse> {
    return this.stocksService.getStocks(params.symbol);
  }

  @Put(':symbol')
  addCheck(@Param() params: SymbolParamDto): Promise<Omit<StockPrice, 'id'>> {
    return this.stocksService.addCheck(params.symbol);
  }

  @Delete(':symbol')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteStock(@Param() params: SymbolParamDto): Promise<void> {
    return this.stocksService.deleteStock(params.symbol);
  }
}
