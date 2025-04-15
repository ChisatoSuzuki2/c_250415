import { useState } from 'react';

const perPageList = [10, 20, 30, 40, 50];

export const usePagination = <T>(entries: T[]) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPageState] = useState(perPageList[0]);
  const totalPage = Math.max(Math.ceil(entries.length / perPage), 1);
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPage - 1;

  const currentEntries = entries.slice(
    perPage * currentPage,
    perPage * (currentPage + 1),
  );

  const moveToFirstPage = () => {
    if (!isFirstPage) setCurrentPage(0);
  };

  const moveToPreviousPage = () => {
    if (!isFirstPage) setCurrentPage(currentPage - 1);
  };

  const moveToNextPage = () => {
    if (!isLastPage) setCurrentPage(currentPage + 1);
  };

  const moveToLastPage = () => {
    if (!isLastPage) setCurrentPage(totalPage - 1);
  };

  const setPerPage = (newPerPage: number) => {
    const newTotalPage = Math.ceil(entries.length / newPerPage);
    setPerPageState(newPerPage);
    setCurrentPage(Math.min(currentPage, newTotalPage - 1));
  };

  return {
    currentEntries,
    currentPage,
    perPage,
    totalPage,
    isFirstPage,
    isLastPage,
    moveToFirstPage,
    moveToPreviousPage,
    moveToNextPage,
    moveToLastPage,
    setPerPage,
    perPageList,
  };
};
