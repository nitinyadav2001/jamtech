// utils/queryHelper.js

export function applySorting(sortBy = 'id', order = 'asc', validSortFields = ['id']) {
    if (!['asc', 'desc'].includes(order)) {
        throw new Error('Invalid sort order');
    }
    if (!validSortFields.includes(sortBy)) {
        throw new Error('Invalid sort field');
    }
    return { [sortBy]: order };
}

export function applyPagination(page = 1, pageSize = 10) {
    page = parseInt(page, 10);
    pageSize = parseInt(pageSize, 10);

    if (isNaN(page) || page <= 0) {
        throw new Error('Invalid page number');
    }

    if (isNaN(pageSize) || pageSize <= 0) {
        throw new Error('Invalid page size');
    }

    return {
        skip: (page - 1) * pageSize,
        take: pageSize,
        paginationInfo: { page, pageSize },
    };
}

export function applyFiltering(filters = {}) {
    const filterConditions = Object.entries(filters).map(([key, value]) => ({
        [key]: { equals: value }
    }));
    return { AND: filterConditions };
}


export function applySearch(search = '', searchFields = []) {
    if (!search || search.trim() === '' || searchFields.length === 0) {
        return {}; // No search applied if the search term or fields are empty
    }

    // Trim the search term and make it case-insensitive
    const searchTerm = search.trim();

    // Construct the OR filter for all the search fields
    const searchFilter = {
        OR: searchFields.map((field) => ({
            [field]: {
                contains: searchTerm,
                mode: 'insensitive', // Case-insensitive search
            },
        })),
    };

    return searchFilter;
}
