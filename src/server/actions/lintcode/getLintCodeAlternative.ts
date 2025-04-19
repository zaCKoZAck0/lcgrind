"use server";

export const getLintCodeAlternative = async (title: string) => {
    const base = "https://apiv1.lintcode.com/v2/api/new-search/all";
    const params = new URLSearchParams({
        query: title,
        page: '1',
        page_size: '1',
    });
    const apiUrl = `${base}?${params}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return `https://www.lintcode.com/problem/${data?.data?.[0]?.id ?? ''}`;

}