import { db } from "~/lib/db";

export async function getAllSheets() {
    try {
        const sheets = await db.sheet.findMany({
            where: {
                isCompany: false
            },
            include: {
                _count: {
                    select: {
                        SheetProblem: true
                    }
                },
                SheetProblem: {
                    select: {
                        problem: {
                            select: {
                                frontendQuestionId: true
                            }
                        }
                    }
                }
            }
        });
        return sheets;
    } catch (error) {
        console.error(error);
        return [];        
    }
}