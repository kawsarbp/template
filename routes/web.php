<?php

declare(strict_types=1);

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AdvanceAccountReportController;
use App\Http\Controllers\AdvancedAccountController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BankAccountController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CashBankReportController;
use App\Http\Controllers\CashFlowController;
use App\Http\Controllers\ColorController;
use App\Http\Controllers\ConditionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FileUploadController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SalePaymentController;
use App\Http\Controllers\SaleReportController;
use App\Http\Controllers\SaleReturnController;
use App\Http\Controllers\SaleReturnPaymentController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\StockPurchaseController;
use App\Http\Controllers\StockPurchasePaymentController;
use App\Http\Controllers\StockReportController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\SupplierPaymentController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::inertia('login', 'Auth/Login')->name('login');
    Route::post('login', [AuthController::class, 'login']);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('stock-purchase-summary', [DashboardController::class, 'stockPurchaseSummary']);

    /* suppliers endpoints */
    Route::get('suppliers/export-excel', [SupplierController::class, 'exportExcel']);
    Route::apiResource('suppliers', SupplierController::class);
    /* suppliers endpoints */

    /* supplier payments endpoints */
    Route::get('supplier-payments/export-excel', [SupplierPaymentController::class, 'exportExcel']);
    Route::get('supplier-payments/create', [SupplierPaymentController::class, 'create']);
    Route::get('supplier-payments/{supplierPayment}/edit', [SupplierPaymentController::class, 'edit']);
    Route::put('supplier-payments/{supplierPayment}', [SupplierPaymentController::class, 'update']);
    Route::delete('supplier-payments/{supplierPayment}', [SupplierPaymentController::class, 'destroy']);
    Route::post('supplier-payments', [SupplierPaymentController::class, 'store']);
    Route::get('supplier-payments', [SupplierPaymentController::class, 'index']);
    /* supplier payments endpoints */

    /* customer advance related endpoints */
    Route::get('reports/sales-summary', [SaleReportController::class, 'salesSummary']);
    Route::get('reports/profit', [SaleReportController::class, 'profitReport']);
    Route::get('reports/stock', [StockReportController::class, 'stockReport']);
    Route::get('reports/customer-advance-export', [AdvanceAccountReportController::class, 'customerAdvancedReportExport']);
    Route::get('reports/customer-advance-pdf', [AdvanceAccountReportController::class, 'customerAdvancedReportPdf']);
    Route::get('reports/customer-advance', [AdvanceAccountReportController::class, 'customerAdvancedReport']);

    Route::post('advanced-accounts/upload-attachment', [FileUploadController::class, 'uploadAttachment']);
    Route::get('advanced-accounts/export-pdf', [AdvancedAccountController::class, 'exportPdf']);
    Route::get('advanced-accounts/export-excel', [AdvancedAccountController::class, 'exportExcel']);
    Route::get('advanced-accounts-receipt/{id}', [AdvancedAccountController::class, 'advanceAccountReceipt']);
    Route::get('advanced-accounts-list/{id}', [AdvancedAccountController::class, 'advanceAccountList']);
    Route::apiResource('advanced-accounts', AdvancedAccountController::class);
    /* customer advance related endpoints */

    /* brands endpoints */
    Route::apiResource('brands', BrandController::class);
    /* brands endpoints */

    /* color endpoints */
    Route::apiResource('colors', ColorController::class);
    Route::apiResource('conditions', ConditionController::class);
    /* color endpoints */

    /* bank accounts endpoints */
    Route::apiResource('bank-accounts', BankAccountController::class);
    /* bank accounts endpoints */

    /* cashflow transactions related endpoints */
    Route::post('cashflow-transactions/upload-attachment', [FileUploadController::class, 'uploadAttachment']);
    Route::get('cashflow-transactions-print-receipt-pdf/{id}', [CashFlowController::class, 'cashflowPrintReceiptPdf']);
    Route::apiResource('cashflow-transactions', CashFlowController::class);
    /* cashflow transactions related endpoints */

    /* bank accounts endpoints */
    Route::post('products/upload-photo', [FileUploadController::class, 'uploadPhoto']);
    Route::get('products/export-excel', [ProductController::class, 'exportExcel']);
    Route::post('products/import-csv', [ProductController::class, 'importCsv']);
    Route::apiResource('products', ProductController::class);
    /* bank accounts endpoints */

    /* stock related endpoints */
    Route::post('stocks/upload-attachment', [FileUploadController::class, 'uploadAttachment']);
    Route::get('stocks/export-excel', [StockController::class, 'exportExcel']);
    Route::post('stocks/import-imei-replace', [StockController::class, 'importImeiReplace']);
    Route::get('stocks', [StockController::class, 'index'])->name('stocks.index');
    Route::get('stocks/{stock}', [StockController::class, 'show'])->name('stocks.show');
    Route::get('stock-purchases/export-excel', [StockPurchaseController::class, 'exportExcel']);
    Route::get('stock-purchases/multi-payment-receipt', [StockPurchasePaymentController::class, 'multiplePaymentReceipt']);
    Route::post('stock-purchases/bulk-payment', [StockPurchasePaymentController::class, 'bulkStore']);
    Route::get('stock-purchases/multiple-payment', [StockPurchasePaymentController::class, 'bulkPayment']);
    Route::get('stock-purchases-pdf/{id}', [StockPurchaseController::class, 'stockPurchasesPdf']);
    Route::post('stock-purchases/import-csv', [StockPurchaseController::class, 'importCsv']);
    Route::apiResource('stock-purchases', StockPurchaseController::class);
    Route::post('stock-purchases/{stock_purchase}/payments', [StockPurchasePaymentController::class, 'store']);
    Route::put('stock-purchase-payments/{payment}', [StockPurchasePaymentController::class, 'update']);
    Route::delete('stock-purchase-payments/{payment}', [StockPurchasePaymentController::class, 'destroy']);
    /* stock related endpoints */

    /* sale related endpoints */
    Route::post('sales/import-csv', [SaleController::class, 'importCsv']);
    Route::post('sales/upload-attachment', [FileUploadController::class, 'uploadAttachment']);
    Route::get('sales/multi-payment-receipt', [SalePaymentController::class, 'multiplePaymentReceipt']);
    Route::post('sales/bulk-payment', [SalePaymentController::class, 'bulkStore']);
    Route::get('sales/multiple-payment', [SalePaymentController::class, 'bulkPayment']);
    Route::post('sales/{sale}/payments', [SalePaymentController::class, 'store']);
    Route::put('sale-payments/{payment}', [SalePaymentController::class, 'update']);
    Route::delete('sale-payments/{payment}', [SalePaymentController::class, 'destroy']);
    Route::get('sales/create', [SaleController::class, 'create']);
    Route::get('sales/{sale}/edit', [SaleController::class, 'edit']);
    Route::get('sales/{sale}/invoice-pdf', [SaleController::class, 'invoicePdf']);
    Route::apiResource('sales', SaleController::class);
    /* sale related endpoints */

    /* sale return related endpoints */
    Route::get('sale-return-payments/receipt', [SaleReturnPaymentController::class, 'paymentReceipt']);
    Route::post('sale-returns/{sale_return}/payments', [SaleReturnPaymentController::class, 'store']);
    Route::delete('sale-return-payments/{payment}', [SaleReturnPaymentController::class, 'destroy']);
    Route::get('sale-returns/create', [SaleReturnController::class, 'create']);
    Route::get('sale-returns/{sale_return}/edit', [SaleReturnController::class, 'edit']);
    Route::apiResource('sale-returns', SaleReturnController::class)->except(['edit']);
    /* sale return related endpoints */

    /* cash bank report related endpoints */
    Route::get('reports/cash-bank-report-excel', [CashBankReportController::class, 'exportExcel']);
    Route::get('reports/cash-bank-report-pdf', [CashBankReportController::class, 'cashBankReportPdf']);
    Route::get('reports/cash-bank-report', [CashBankReportController::class, 'index']);
    /* cash bank report related endpoints */

    /* users related endpoints */
    Route::put('users/{id}/permissions', [UserController::class, 'updatePermissions']);
    Route::get('users/{id}/permissions', [UserController::class, 'permissions']);
    Route::get('users/export-excel', [UserController::class, 'exportExcel']);
    Route::apiResource('users', UserController::class);
    /* users related endpoints */

    /* permissions endpoints */
    Route::get('roles/module-permissions', [RoleController::class, 'allPermissions']);
    Route::apiResource('roles', RoleController::class);
    /* permissions endpoints */

    /* activity logs related endpoints */
    Route::get('/activity-logs/list/{type}/{id}', [ActivityLogController::class, 'activityList']);
    Route::get('/activity-logs/{id}/{type}', [ActivityLogController::class, 'show']);
    Route::apiResource('activity-logs', ActivityLogController::class)->only('index');
    /* activity logs related endpoints */

    /* search related endpoints */
    Route::prefix('search')->controller(SearchController::class)
        ->group(function (): void {
            Route::get('roles', 'searchRole');
            Route::get('users', 'searchUser');
Route::get('suppliers', 'searchSupplier');
            Route::get('brands', 'searchBrand');
            Route::get('colors', 'searchColor');
            Route::get('conditions', 'searchCondition');
            Route::get('bank-accounts', 'searchBankAccount');
            Route::get('products', 'searchProduct');
            Route::get('stocks', 'searchStock');
            Route::get('stock-purchase-batches', 'searchStockPurchaseBatch');
            Route::get('supplier-purchases', 'searchSupplierPurchases');
            Route::get('sale-items', 'searchSaleItems');
            Route::get('sold-stocks', 'searchSoldStocks');
        });
    /* search related endpoints */
});

Route::get('test', function () {
    Artisan::call('storage:link');
    dd('done');
});

require __DIR__.'/settings.php';
