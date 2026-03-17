package com.skywatch.shared;

import lombok.Builder;
import org.springframework.data.domain.Page;
import java.util.List;

@Builder
public record PageResponse<T>(
    List<T> data,
    int page,
    int size,
    long totalElements,
    int totalPages
) {
    public static <T> PageResponse<T> from(Page<?> page, List<T> content) {
        return PageResponse.<T>builder()
            .data(content)
            .page(page.getNumber())
            .size(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .build();
    }
}
