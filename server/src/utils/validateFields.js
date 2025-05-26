
function validateMandatoryFields(fields) {
    for (const field of fields) {
        const { key, value } = field;

        if (!value || typeof value !== 'string' || value.trim() === '') {
            throw new Error(`${key} is required and must be a non-empty string.`);
        }
    }
}

export default validateMandatoryFields;
