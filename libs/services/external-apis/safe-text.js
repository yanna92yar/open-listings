export const safeText = async (params) => {
    return {
        call_response: {
            result: {
                clean: params.text,
                additional: {
                    language: 'en',
                },
            },
        },
    }.call_response.result
}
