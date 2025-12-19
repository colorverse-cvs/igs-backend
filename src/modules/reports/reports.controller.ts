import { Controller, Get, Query, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery, } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('sales')
    @Roles(Role.Admin)
    @ApiOperation({ summary: 'Get sales report (Admin only)' })
    @ApiQuery({ name: 'startDate', required: true, example: '2025-01-01', description: 'Start date for the report (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: true, example: '2025-01-31', description: 'End date for the report (YYYY-MM-DD)' })
    @ApiResponse({ status: 200, description: 'Sales report generated successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    getSalesReport(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.reportsService.getSalesReport(new Date(startDate), new Date(endDate));
    }

    @Get('analytics')
    @Roles(Role.Admin)
    @ApiOperation({ summary: 'Get analytics report (Admin only)' })
    @ApiResponse({ status: 200, description: 'Analytics data retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    getAnalytics() {
        return this.reportsService.getAnalytics();
    }

    @Get('customers')
    @Roles(Role.Admin)
    @ApiOperation({ summary: 'Get customers report with order stats (Admin only)' })
    @ApiResponse({ status: 200, description: 'Customers analytics retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    getCustomersReport(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
    ) {
        return this.reportsService.getCustomersWithStats(+page, +limit);
    }

}
