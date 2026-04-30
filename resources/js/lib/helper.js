import axios from "axios";
import { accountOptions, cashFlowType, ownerApprovalStatus } from "./options";

export const generateParams = (params) => {
    let paramsObj = {};
    for (let [key, value] of Object.entries(params)) {
        if (params[key]) {
            paramsObj = { ...paramsObj, [key]: value };
        }
    }
    return paramsObj;
};

export const resetBtnOnOfCheck = (params, skipProperty = {}) => {
    let flag = false;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (let [key, value] of Object.entries(params)) {
        if (params[key] && (key !== 'limit' && key !== 'page' && key !== skipProperty[key])) {
            flag = true;
        }
    }
    return flag;
};


export const fileRouteHandler = ({ data, setDownloadLoading, url }) => {
    setDownloadLoading(true);
    axios({
        url: url,
        method: 'GET',
        responseType: 'blob',
        params: data,
    }).then((response) => {
        const contentDisposition = response.headers['content-disposition'];
        const fileName = contentDisposition
            ? contentDisposition.split('filename=')[1].replace(/"/g, '')
            : 'download.xlsx';
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setDownloadLoading(false);
    }).catch(() => {
        setDownloadLoading(false);
    })
};

export const mergeData = (items, apiData) => {
    return items.map((item) => {
        const dynamicInfo = apiData[item.id] || {};

        const mergedItem = {
            ...item,
            ...dynamicInfo,
        };

        if (item.children) {
            mergedItem.children = mergeData(item.children, apiData);
        }

        return mergedItem;
    });
};

export const objectToQueryParams = (params = {}) => {
    return Object.entries(params)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, value]) => value !== null && value !== undefined && value !== "")
        .map(([key, value]) => {
            if (Array.isArray(value)) {
                return value.map(v => `${key}=${v}`).join("&");
            }
            return `${key}=${value}`;
        })
        .join("&");
};

export const ensureLeadingSlash = (path) => {
    if (!path) return "";

    return path.startsWith("/") ? path : `/${path}`;
}


export const getStatusLabel = (status) => {
    if (status == 1) return "Active";
    if (status == 2) return "Inactive";
    return status;
};

export const getCashflowTypeLabel = (type) => {
    const cashFlowTypeLabel = cashFlowType.find((item) => item.value == type);
    return cashFlowTypeLabel ? cashFlowTypeLabel.label : type;
};

export const getAccountLabel = (account) => {
    const accountLabel = accountOptions.find((item) => item.value == account);
    return accountLabel ? accountLabel.label : account;
};

export const getOwnerApprovalLabel = (status) => {
    const ownerApproval = ownerApprovalStatus.find((item) => item.value == status);
    return ownerApproval ? ownerApproval.label : status;
}


export const formatDateToYMD = (dateInput) => {
    const date = new Date(dateInput);

    if (isNaN(date)) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export const formatDateDMY = (isoString) => {
    const date = new Date(isoString);

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
}


// Parse a "YYYY-MM-DD" string as local midnight to avoid UTC offset shifting the day.
export const parseLocalDate = (str) => {
    if (!str) return undefined;
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
};

export const formatDateRange = (range) => {
    if (!range?.from) return "";

    const fromDate = formatDateToYMD(range.from);
    if (!range.to) return fromDate;

    const toDate = formatDateToYMD(range.to);

    if (fromDate === toDate) {
        return fromDate;
    }

    return `${fromDate} to ${toDate}`;
}

export const parseDateRange = (rangeStr) => {
    if (!rangeStr || typeof rangeStr !== 'string') return undefined;

    const parse = (s) => {
        const parts = s.split('-');
        if (parts.length === 3) {
            // new Date(year, monthIndex, day) creates date in local time
            const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            return isNaN(d.getTime()) ? undefined : d; // Use getTime() to check for invalid date
        }
        const d = new Date(s);
        return isNaN(d.getTime()) ? undefined : d; // Use getTime() to check for invalid date
    };

    if (rangeStr.includes(" to ")) {
        const [from, to] = rangeStr.split(" to ");
        return {
            from: parse(from),
            to: parse(to)
        };
    }

    const date = parse(rangeStr);
    if (!date) return undefined;

    return {
        from: date,
        to: undefined
    };
}



export const getProductStatusLabel = (status) => {
    const productStatus = [
        { id: 1, value: 1, label: "In Stock" },
        { id: 2, value: 2, label: "Sold" },
        { id: 3, value: 3, label: "Reserved" },
        { id: 4, value: 4, label: "Pending Inspection" },
        { id: 5, value: 5, label: "Refurbishing" },
    ];
    const statusLabel = productStatus.find((item) => item.value == status);
    return statusLabel ? statusLabel.label : status;
};

export const getProductConditionLabel = (condition) => {
    const productCondition = [
        { id: 1, value: 1, label: "Excellent" },
        { id: 2, value: 2, label: "Very Good" },
        { id: 3, value: 3, label: "Good" },
        { id: 4, value: 4, label: "Fair" },
        { id: 5, value: 5, label: "Poor" },
    ];
    const conditionLabel = productCondition.find((item) => item.value == condition);
    return conditionLabel ? conditionLabel.label : condition;
};

export const getBooleanStatusLabel = (status) => {
    const booleanStatus = [
        { id: 1, value: 1, label: "Yes" },
        { id: 2, value: 2, label: "No" },
    ];
    const statusLabel = booleanStatus.find((item) => item.value == status);
    return statusLabel ? statusLabel.label : status;
};



