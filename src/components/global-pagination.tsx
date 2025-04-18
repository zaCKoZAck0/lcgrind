"use client";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "~/components/ui/pagination"
import { usePathname, useRouter } from 'next/navigation';
import React from "react";

type GlobalPaginationProps = {
    totalPages: number,
    currentPage: number,
}

export function GlobalPagination({ totalPages, currentPage }: GlobalPaginationProps) {
    const MAX_VISIBILITY = 2;
    const router = useRouter();
    const pathname = usePathname();

    const handlePageClick = (page: number) => {
        router.push(`${pathname}?page=${page}`);
    };

    if (totalPages <= 1) {
        return null; // Don't show pagination if there's only one page
    }

    const getPageNumbers = () => {
        const pageNumbers: (number | 'ellipsis')[] = [];

        if (totalPages <= MAX_VISIBILITY) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= Math.ceil(MAX_VISIBILITY / 2)) {
                for (let i = 1; i <= MAX_VISIBILITY; i++) {
                    pageNumbers.push(i);
                }
                if (totalPages > MAX_VISIBILITY) {
                    pageNumbers.push('ellipsis');
                    pageNumbers.push(totalPages);
                }
            } else if (currentPage >= totalPages - Math.floor(MAX_VISIBILITY / 2)) {
                pageNumbers.push(1);
                if (totalPages > MAX_VISIBILITY) {
                    pageNumbers.push('ellipsis');
                }
                for (let i = totalPages - MAX_VISIBILITY + 1; i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                pageNumbers.push(1);
                pageNumbers.push('ellipsis');
                pageNumbers.push(currentPage - 1);
                pageNumbers.push(currentPage);
                pageNumbers.push(currentPage + 1);
                pageNumbers.push('ellipsis');
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };

    const pageNumbersToRender = getPageNumbers();

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        size='sm'
                        href={currentPage > 1 ? `${pathname}?page=${currentPage - 1}` : undefined}
                        onClick={() => currentPage > 1 && handlePageClick(currentPage - 1)}
                    // disabled={currentPage <= 1}
                    />
                </PaginationItem>
                {pageNumbersToRender.map((page, index) => (
                    <React.Fragment key={index}>
                        {page === 'ellipsis' ? (
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                        ) : (
                            <PaginationItem>
                                <PaginationLink
                                    size='sm'
                                    isActive={page === currentPage}
                                    href={`${pathname}?page=${page}`}
                                    onClick={() => handlePageClick(page)}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        )}
                    </React.Fragment>
                ))}
                <PaginationItem>
                    <PaginationNext
                        size='sm'
                        href={currentPage < totalPages ? `${pathname}?page=${currentPage + 1}` : undefined}
                        onClick={() => currentPage < totalPages && handlePageClick(currentPage + 1)}
                    // disabled={currentPage >= totalPages}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}