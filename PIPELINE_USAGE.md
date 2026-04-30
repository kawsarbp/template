# Pipeline Filter Pattern - Usage Guide

A clean, declarative approach to filtering and searching in Laravel using the Pipeline pattern.

## Quick Start

### 1. Create a Service Class

```php
namespace App\Services;

use App\Filters\SearchFilter;
use App\Filters\ExactMatchFilter;
use App\Filters\DateRangeFilter;
use App\Models\Order;

class OrderService extends BaseFilterService
{
    protected string $model = Order::class;

    protected function filterConfig(): array
    {
        return [
            'search' => [
                'filter' => SearchFilter::class,
                'params' => [
                    'searchTerm' => '$search',
                    'columns' => ['order_number', 'customer_name'],
                ],
            ],

            'status' => [
                'filter' => ExactMatchFilter::class,
                'params' => [
                    'column' => 'status',
                    'value' => '$status',
                ],
            ],

            'date_range' => [
                'filter' => DateRangeFilter::class,
                'keys' => ['date_from', 'date_to'],
                'params' => [
                    'column' => 'created_at',
                    'startDate' => '$date_from',
                    'endDate' => '$date_to',
                ],
            ],
        ];
    }
}
```

### 2. Use in Controllers

```php
public function index(Request $request)
{
    $orderService = new OrderService();

    $orders = $orderService->getFiltered(
        filters: $request->all(),
        perPage: 15
    );

    return Inertia::render('Orders/Index', ['orders' => $orders]);
}
```

## Configuration Syntax

### Basic Filter

```php
'filter_key' => [
    'filter' => FilterClass::class,
    'params' => [
        'paramName' => '$filter_key',  // Reference to filter input
    ],
],
```

### Multiple Keys (OR Logic)

When a filter depends on multiple input keys, use the `keys` array:

```php
'date_range' => [
    'filter' => DateRangeFilter::class,
    'keys' => ['date_from', 'date_to'],  // Filter applies if ANY key is present
    'params' => [
        'column' => 'created_at',
        'startDate' => '$date_from',
        'endDate' => '$date_to',
    ],
],
```

### Parameter Value Types

1. **Reference to filter input** (string starting with `$`):
```php
'searchTerm' => '$search'  // Gets value from $filters['search']
```

2. **Literal value** (any other type):
```php
'column' => 'email'  // Literal string 'email'
'columns' => ['name', 'email']  // Literal array
```

3. **Callable** (for dynamic logic):
```php
'direction' => fn($filters) => $filters['sort_direction'] ?? 'asc'
```

### Custom Logic with Callables

For complex conditions, use a callable:

```php
protected function filterConfig(): array
{
    return [
        // Standard filters...
        'search' => [...],

        // Custom logic with callable
        fn($filters) => ! empty($filters['has_orders'])
            ? new RelationFilter('orders', 'id', '>', 0)
            : null,
    ];
}
```

## Available Filters

### SearchFilter
Search across multiple columns with LIKE. Supports both direct columns and relational columns using dot notation.

**Basic Search (Direct Columns):**
```php
'search' => [
    'filter' => SearchFilter::class,
    'params' => [
        'searchTerm' => '$search',
        'columns' => ['name', 'email', 'phone'],
    ],
],
```

**Relational Search (Using Dot Notation):**
```php
'search' => [
    'filter' => SearchFilter::class,
    'params' => [
        'searchTerm' => '$search',
        'columns' => [
            'order_number',           // Direct column
            'customer_name',          // Direct column
            'customer.email',         // Search in customer relationship
            'items.product.name',     // Search in nested relationships
        ],
    ],
],
```

**How It Works:**
- Direct columns (e.g., `'name'`) use `WHERE name LIKE '%search%'`
- Relational columns (e.g., `'posts.title'`) use `whereHas('posts', fn($q) => $q->where('title', 'LIKE', '%search%'))`
- All conditions are combined with OR logic
- Supports nested relationships (e.g., `'customer.address.city'`)

### ExactMatchFilter
Exact value matching.

```php
'status' => [
    'filter' => ExactMatchFilter::class,
    'params' => [
        'column' => 'status',
        'value' => '$status',
    ],
],
```

### DateRangeFilter
Filter by date range.

```php
'date_range' => [
    'filter' => DateRangeFilter::class,
    'keys' => ['start_date', 'end_date'],
    'params' => [
        'column' => 'created_at',
        'startDate' => '$start_date',
        'endDate' => '$end_date',
    ],
],
```

### InFilter
Filter where value is in array (whereIn).

```php
'statuses' => [
    'filter' => InFilter::class,
    'params' => [
        'column' => 'status',
        'values' => '$statuses',  // Expects array
    ],
],
```

### RangeFilter
Numeric range filtering.

```php
'price_range' => [
    'filter' => RangeFilter::class,
    'keys' => ['min_price', 'max_price'],
    'params' => [
        'column' => 'price',
        'min' => '$min_price',
        'max' => '$max_price',
    ],
],
```

### RelationFilter
Filter by relationship conditions.

```php
'category' => [
    'filter' => RelationFilter::class,
    'params' => [
        'relation' => 'category',
        'column' => 'id',
        'value' => '$category_id',
        'operator' => '=',
    ],
],
```

### SortFilter
Sort results.

```php
'sort_by' => [
    'filter' => SortFilter::class,
    'params' => [
        'column' => '$sort_by',
        'direction' => fn($filters) => $filters['sort_direction'] ?? 'asc',
    ],
],
```

## Complete Example

### OrderService

```php
namespace App\Services;

use App\Filters\{
    SearchFilter,
    ExactMatchFilter,
    InFilter,
    DateRangeFilter,
    RangeFilter,
    RelationFilter,
    SortFilter
};
use App\Models\Order;

class OrderService extends BaseFilterService
{
    protected string $model = Order::class;

    protected function filterConfig(): array
    {
        return [
            'search' => [
                'filter' => SearchFilter::class,
                'params' => [
                    'searchTerm' => '$search',
                    'columns' => [
                        'order_number',        // Search in order number
                        'notes',               // Search in order notes
                        'customer.name',       // Search in customer's name
                        'customer.email',      // Search in customer's email
                        'items.product.name',  // Search in product names
                    ],
                ],
            ],

            'status' => [
                'filter' => ExactMatchFilter::class,
                'params' => [
                    'column' => 'status',
                    'value' => '$status',
                ],
            ],

            'statuses' => [
                'filter' => InFilter::class,
                'params' => [
                    'column' => 'status',
                    'values' => '$statuses',
                ],
            ],

            'customer' => [
                'filter' => ExactMatchFilter::class,
                'params' => [
                    'column' => 'customer_id',
                    'value' => '$customer_id',
                ],
            ],

            'order_date' => [
                'filter' => DateRangeFilter::class,
                'keys' => ['date_from', 'date_to'],
                'params' => [
                    'column' => 'order_date',
                    'startDate' => '$date_from',
                    'endDate' => '$date_to',
                ],
            ],

            'price_range' => [
                'filter' => RangeFilter::class,
                'keys' => ['min_price', 'max_price'],
                'params' => [
                    'column' => 'total_amount',
                    'min' => '$min_price',
                    'max' => '$max_price',
                ],
            ],

            'category' => [
                'filter' => RelationFilter::class,
                'params' => [
                    'relation' => 'items.product.category',
                    'column' => 'id',
                    'value' => '$category_id',
                ],
            ],

            'sort_by' => [
                'filter' => SortFilter::class,
                'params' => [
                    'column' => '$sort_by',
                    'direction' => fn($filters) => $filters['sort_direction'] ?? 'desc',
                ],
            ],
        ];
    }
}
```

### Controller Usage

```php
namespace App\Http\Controllers;

use App\Http\Requests\OrderFilterRequest;
use App\Services\OrderService;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    public function index(OrderFilterRequest $request)
    {
        $orders = $this->orderService->getFiltered(
            filters: $request->validated(),
            perPage: $request->input('per_page', 15)
        );

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'filters' => $request->validated(),
        ]);
    }
}
```

### Form Request

```php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderFilterRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'search' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:pending,processing,completed,cancelled',
            'statuses' => 'nullable|array',
            'statuses.*' => 'string|in:pending,processing,completed,cancelled',
            'customer_id' => 'nullable|integer|exists:customers,id',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|gt:min_price',
            'category_id' => 'nullable|integer|exists:categories,id',
            'sort_by' => 'nullable|string|in:order_number,created_at,total_amount,customer_name',
            'sort_direction' => 'nullable|string|in:asc,desc',
            'per_page' => 'nullable|integer|min:1|max:100',
        ];
    }
}
```

## Creating Custom Filters

Create a new filter by implementing the `QueryFilter` interface:

```php
namespace App\Filters;

use App\Contracts\QueryFilter;
use Illuminate\Database\Eloquent\Builder;

class IsActiveFilter implements QueryFilter
{
    public function __construct(
        protected bool $isActive = true
    ) {}

    public function handle(Builder $query, \Closure $next): Builder
    {
        if ($this->isActive) {
            $query->where('is_active', true);
        }

        return $next($query);
    }
}
```

Then use it in your service:

```php
'is_active' => [
    'filter' => IsActiveFilter::class,
    'params' => [
        'isActive' => '$is_active',
    ],
],
```

## Practical Examples

### Example 1: Order Search Across Multiple Relationships

Search orders by customer details and product information:

```php
class OrderService extends BaseFilterService
{
    protected string $model = Order::class;

    protected function filterConfig(): array
    {
        return [
            'search' => [
                'filter' => SearchFilter::class,
                'params' => [
                    'searchTerm' => '$search',
                    'columns' => [
                        'order_number',           // Order number
                        'tracking_number',        // Tracking number
                        'customer.name',          // Customer name
                        'customer.email',         // Customer email
                        'customer.phone',         // Customer phone
                        'items.product.name',     // Product names in order
                        'items.product.sku',      // Product SKUs
                        'shippingAddress.city',   // Shipping city
                    ],
                ],
            ],
        ];
    }
}

// Usage: Search for orders containing "laptop" in any related field
$orders = $orderService->getFiltered(['search' => 'laptop'], 20);
```

### Example 2: Combining Relational Search with Other Filters

```php
// Search for orders with "electronics" in product names,
// from customers in a specific city, placed in 2024
$orders = $orderService->getAllFiltered([
    'search' => 'electronics',       // Searches across order and product fields
    'customer_city' => 'New York',   // Filter by customer city
    'date_from' => '2024-01-01',     // Orders from 2024
    'status' => 'completed',         // Only completed orders
    'sort_by' => 'created_at',       // Sort by date
    'sort_direction' => 'desc',      // Newest first
]);
```

## Benefits

✅ **Clean & Declarative** - No repetitive if statements
✅ **Reusable** - Same filter class works across different models
✅ **Type Safe** - Full PHP type hints
✅ **Testable** - Each filter can be tested independently
✅ **Maintainable** - Easy to add/remove filters
✅ **Flexible** - Supports dynamic columns and custom logic

## Running Tests

```bash
# Run all filter tests
php artisan test --filter=Filter

# Run specific service tests
php artisan test --filter=UserService

# Run all tests
php artisan test
```
