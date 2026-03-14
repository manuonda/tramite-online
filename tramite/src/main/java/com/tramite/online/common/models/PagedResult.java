package com.tramite.online.common.models;



import java.util.List;
import java.util.function.Function;

/**
 * A generic class to represent paginated results.
 * This class encapsulates the data for a single page of results along with pagination metadata.
 * The pagination metadata includes information about the current page, page size, total number of elements,
 * and whether the current page is the first or last page, as well as if there are
 * next or previous pages available.
 * This class is designed to be flexible and can be used with any type of data by specifying the type parameter T.
 *
 * @author dgarcia
 * @version 1.0
 * @param data
 * @param totalElements
 * @param isFirst
 * @param isLast
 * @param hasNext
 * @param hasPrevious
 * @param <T>
 */
public record PagedResult<T>(
        List<T> data,
        long totalElements,
        int pageNumber,
        int totalPages,
        boolean isFirst,
        boolean isLast,
        boolean hasNext,
        boolean hasPrevious
) {

    public static <S, T> PagedResult<T> of(PagedResult<S> source, Function<S, T> mapper) {
        List<T> mappedData = source.data().stream()
                .map(mapper)
                .toList();
        return new PagedResult<>(
                mappedData,
                source.totalElements(),
                source.pageNumber(),
                source.totalPages(),
                source.isFirst(),
                source.isLast(),
                source.hasNext(),
                source.hasPrevious()
        );
    }



}
