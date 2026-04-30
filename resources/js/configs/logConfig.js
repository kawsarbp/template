import { getBooleanStatusLabel, getCashflowTypeLabel, getProductConditionLabel, getProductStatusLabel, getStatusLabel } from "@/lib/helper";


export const logConfig = {

    customer: [
        {
            sectionName: "Customer Information",
            fields: [
                { label: "Name", field: "name" },
                { label: "Email", field: "email" },
                { label: "Company", field: "company_name" },
                { label: "Phone", field: "phone" },
                { label: "Country", field: "country" },
                { label: "State", field: "state" },
                { label: "City", field: "city" },
                { label: "Advance Payment Balance", field: "advance_payment_balance" },
                { label: "Address", field: "address" },
                { field: "status", callback: (value) => getStatusLabel(value) },

            ]
        }
    ],

    bank_account: [
        {
            sectionName: "Bank Account Information",
            fields: [
                { label: "Holder Name", field: "holder_name" },
                { label: "Account Number", field: "account_number" },
                { label: "Name", field: "name" },
                { label: "Opening Balance", field: "opening_balance" },
            ]
        }
    ],

    user: [
        {
            sectionName: "User Information",
            fields: [
                { field: "name" },
                { field: "email" },
                { label: "Role", field: "role.name" },
                { field: "status", callback: (v) => getStatusLabel(v) },
            ]
        },
    ],

    cashflow_transaction: [
        {
            sectionName: "Cashflow Transaction Information",
            fields: [
                { label: "Type", field: "type", callback: (v) => getCashflowTypeLabel(v) },
                { label: "Amount", field: "amount" },
                { label: "Name", field: "name" },
                { label: "Date", field: "date" },
                { label: "Description", field: "description" },
                { label: "Payment Mode", field: "payment_method.holder_name" },
            ]
        },
        {
            sectionName: "Attachment",
            isPhoto: true,
            layout: "sections",
            photoKeys: ["attachment"],
            fields: []
        }
    ],

    product: [
        {
            sectionName: "General Information",
            fields: [
                { label: "Title", field: "title" },
                { label: "SKU", field: "sku" },
                { label: "Brand", field: "brand" },
                { label: "Model", field: "model" },
                { label: "Color", field: "color" },
                { label: "Storage Capacity (GB)", field: "storage_capacity" },
                { label: "RAM (GB)", field: "ram" },
                { label: "Condition", field: "condition", callback: (v) => getProductConditionLabel(v) },
                { label: "Status", field: "status", callback: (v) => getProductStatusLabel(v) },
                { label: "Quantity", field: "quantity" },
                { label: "Location", field: "location" },
            ]
        },
        {
            sectionName: "Hardware & Components",
            fields: [
                { label: "Original Box", field: "original_box", callback: (v) => getBooleanStatusLabel(v) },
                { label: "Charger", field: "has_charger", callback: (v) => getBooleanStatusLabel(v) },
                { label: "Accessories", field: "has_accessories", callback: (v) => getBooleanStatusLabel(v) },
                { label: "Unlocked", field: "is_unlocked", callback: (v) => getBooleanStatusLabel(v) },
                { label: "Battery Health (%)", field: "battery_health" },
                { label: "IMEI", field: "imei" },
                { label: "Serial Number", field: "serial_number" },
                { label: "Carrier", field: "carrier" },
                { label: "Operating System", field: "operating_system" },
                { label: "Featured", field: "is_featured", callback: (v) => getBooleanStatusLabel(v) },
                { label: "Active", field: "is_active", callback: (v) => getBooleanStatusLabel(v) },
            ]
        },
        {
            sectionName: "Pricing Details",
            fields: [
                { label: "Purchase Price", field: "purchase_price" },
                { label: "Selling Price", field: "selling_price" },
                { label: "Original Price", field: "original_price" },
            ]
        },
        {
            sectionName: "Additional Details",
            fields: [
                { label: "Description", field: "description" },
                { label: "Defects", field: "defects" },
                { label: "Sold At", field: "sold_at" },
            ]
        },
        {
            sectionName: "Photos",
            isPhoto: true,
            layout: "sections",
            photoKeys: ["photos"],
            fields: []
        }
    ],



    // 1. Towing Rate (Handles Literal Dots and Deep Nesting)
    towing_rate: [
        {
            sectionName: "Rate Pricing",
            fields: [
                { label: "Base Rate", field: "rate" },
                { label: "Rate A", field: "rate_a" },
                { label: "Rate B", field: "rate_b" },
                { field: "status", callback: (value) => getStatusLabel(value) },
            ]
        },
        {
            sectionName: "Location & Identity",
            fields: [
                { label: "City Name", field: "city.name" }, // Handles "city.name" literal key
                { label: "State", field: "state.name" },
                { label: "Country", field: "country.name" },
                { label: "Location", field: "location.name" },
                { label: "Deep Name", field: "name.name.name" }, // Handles nested path
            ]
        },
        {
            sectionName: "Vehicle Photos",
            isPhoto: true,
            layout: "sections",
            photoKeys: ["photos"],
            fields: []
        }
    ],

    // 2. Vehicle (Handles multiple photo categories)
    vehicle: [
        {
            sectionName: "Vehicle Identification",
            fields: [
                { label: "VIN", field: "vin_number" },
                { label: "Lot #", field: "lot_number" },
                { label: "Year", field: "year" },
                { label: "Make", field: "vehicle_make.name" },
                { label: "Model", field: "vehicle_model.name" },
                { label: "Color", field: "vehicle_color.name" },
            ]
        },
        {
            sectionName: "Customer & Purchase",
            fields: [
                { label: "Customer", field: "customer.name" },
                { label: "Purchase Date", field: "purchase_date" },
                { label: "Pickup Date", field: "pickup_date" },
                { label: "Tow Fee", field: "tow_fee" },
                { field: "status", callback: (value) => getStatusLabel(value) },
            ]
        },
        {
            sectionName: "Media Gallery",
            isPhoto: true,
            layout: "tabs", // Use tabs for vehicles since they have many categories
            photoKeys: ["yard_photos", "pickup_photos", "arrived_photos", "auction_photos", "pictures"],
            fields: []
        }
    ],



    // 4. Container (Handles lists of objects like vehicle logs)
    load_ship: [
        {
            sectionName: "Shipping Details",
            fields: [
                { label: "Manifest #", field: "manifest_number" },
                { label: "Ship", field: "ship.name" },
                { label: "Status", field: "status", callback: (v) => getStatusLabel(v) },
                { label: "Loading Date", field: "loading_date" },
                { label: "Arrived Date", field: "arrived_date" },
                { label: "Unload Date", field: "unload_date" },
                { label: "Cut Off Date", field: "cut_off_date" },
                { label: "Discharge Port", field: "port_of_discharge_item.name" },
                { label: "Loading Port", field: "port_of_loading" },
                { label: "Handed Over Date", field: "handed_over_date" },
            ]
        },
        {
            sectionName: "Provider & Instructions",
            fields: [
                { label: "Provider Name", field: "service_provider.name" },
                { label: "Contact Detail", field: "contact_detail" },
                { label: "Special Instructions", field: "special_instructions" },
            ]
        },
        {
            sectionName: "Included Vehicles",
            fields: [
                {
                    label: "List of Vehicles",
                    field: "container_vehicle_log",
                    callback: {
                        arrayFields: ["vin", "lot_number", "customer_name", "status_name"],
                        labels: { vin: "VIN", status_name: "Current Status" }
                    }
                },
            ]
        },
        {
            sectionName: "Files & Photos",
            layout: "tabs",
            isPhoto: true,
            isAttachment: true,
            photoKeys: ["photos", "attachments"],
            fields: []
        }
    ],

    // 5. Load Trailer (Handles trailer specific shipping)
    load_trailer: [
        {
            sectionName: "Trailer Details",
            fields: [
                { label: "CMR #", field: "manifest_number" },
                { label: "Status", field: "status", callback: (v) => getStatusLabel(v) },
                { label: "Trailer ID", field: "trailer_id" },
                { label: "Loading Date", field: "loading_date" },
                { label: "Arrived Date", field: "arrived_date" },
                { label: "Unload Date", field: "unload_date" },
                { label: "Cut Off Date", field: "cut_off_date" },
                { label: "Discharge Port", field: "port_of_discharge_item.name" },
            ]
        },
        {
            sectionName: "Provider & Instructions",
            fields: [
                { label: "Provider Name", field: "service_provider.name" },
                { label: "Contact Detail", field: "contact_detail" },
                { label: "Special Instructions", field: "special_instructions" },
            ]
        },
        {
            sectionName: "Included Vehicles",
            fields: [
                {
                    label: "List of Vehicles",
                    field: "container_vehicle_log",
                    callback: {
                        arrayFields: ["vin", "lot_number", "customer_name", "status_name"],
                        labels: { vin: "VIN", status_name: "Status" }
                    }
                },
            ]
        },
        {
            sectionName: "Files & Photos",
            layout: "sections",
            isPhoto: true,
            isAttachment: true,
            photoKeys: ["photos", "attachments"],
            fields: []
        }
    ],

    country: [
        { field: "name" },
        { field: "short_code" },
        { field: "status", callback: (value) => getStatusLabel(value) },
    ],

    state: [
        { field: "name" },
        { field: "short_code" },
        { label: "Country", field: "country.name" },
        { field: "status", callback: (value) => getStatusLabel(value) },
    ],


    // --- EXAMPLES FOR ARRAYS ---
    example_model: [
        {
            sectionName: "Array Examples",
            fields: [
                // 1. Array of Objects WITH FILTERING
                // We pass an object to 'callback' with arrayFields and labels
                {
                    label: "Selected Items",
                    field: "items_list",
                    callback: {
                        arrayFields: ["vin", "lot_number", "customer_name"], // Only show these
                        labels: { vin: "VIN #", customer_name: "Owner" } // Custom column headers
                    }
                },

                // 2. Simple Array (Will be rendered as Badges)
                { label: "Tags / IDs", field: "tags_array" },

                // 3. Nested Array of Objects
                { label: "Nested History", field: "metadata.history_logs" }
            ]
        }
    ]
};
