package com.aa.saf.broker.dto;

import java.util.List;

public class PageResponse<T> {
    private List<T> content;
    private PageInfo pageable;
    private int totalElements;
    private int totalPages;
    private boolean last;
    private int size;
    private int number;
    private SortInfo sort;
    private boolean first;
    private int numberOfElements;
    private boolean empty;
    
    public PageResponse() {}
    
    public PageResponse(List<T> content, int page, int size, long totalElements, boolean sorted) {
        this.content = content;
        this.totalElements = (int) totalElements;
        this.totalPages = (int) Math.ceil((double) totalElements / size);
        this.size = size;
        this.number = page;
        this.numberOfElements = content.size();
        this.first = page == 0;
        this.last = page >= totalPages - 1;
        this.empty = content.isEmpty();
        
        // Create pageable info
        this.pageable = new PageInfo(page, size, sorted);
        this.sort = new SortInfo(!sorted, sorted, sorted);
    }
    
    // Getters and setters
    public List<T> getContent() { return content; }
    public void setContent(List<T> content) { this.content = content; }
    
    public PageInfo getPageable() { return pageable; }
    public void setPageable(PageInfo pageable) { this.pageable = pageable; }
    
    public int getTotalElements() { return totalElements; }
    public void setTotalElements(int totalElements) { this.totalElements = totalElements; }
    
    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
    
    public boolean isLast() { return last; }
    public void setLast(boolean last) { this.last = last; }
    
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
    
    public int getNumber() { return number; }
    public void setNumber(int number) { this.number = number; }
    
    public SortInfo getSort() { return sort; }
    public void setSort(SortInfo sort) { this.sort = sort; }
    
    public boolean isFirst() { return first; }
    public void setFirst(boolean first) { this.first = first; }
    
    public int getNumberOfElements() { return numberOfElements; }
    public void setNumberOfElements(int numberOfElements) { this.numberOfElements = numberOfElements; }
    
    public boolean isEmpty() { return empty; }
    public void setEmpty(boolean empty) { this.empty = empty; }
    
    // Inner classes for structured response
    public static class PageInfo {
        private int pageNumber;
        private int pageSize;
        private SortInfo sort;
        private int offset;
        private boolean unpaged;
        private boolean paged;
        
        public PageInfo() {}
        
        public PageInfo(int pageNumber, int pageSize, boolean sorted) {
            this.pageNumber = pageNumber;
            this.pageSize = pageSize;
            this.offset = pageNumber * pageSize;
            this.unpaged = false;
            this.paged = true;
            this.sort = new SortInfo(!sorted, sorted, sorted);
        }
        
        // Getters and setters
        public int getPageNumber() { return pageNumber; }
        public void setPageNumber(int pageNumber) { this.pageNumber = pageNumber; }
        
        public int getPageSize() { return pageSize; }
        public void setPageSize(int pageSize) { this.pageSize = pageSize; }
        
        public SortInfo getSort() { return sort; }
        public void setSort(SortInfo sort) { this.sort = sort; }
        
        public int getOffset() { return offset; }
        public void setOffset(int offset) { this.offset = offset; }
        
        public boolean isUnpaged() { return unpaged; }
        public void setUnpaged(boolean unpaged) { this.unpaged = unpaged; }
        
        public boolean isPaged() { return paged; }
        public void setPaged(boolean paged) { this.paged = paged; }
    }
    
    public static class SortInfo {
        private boolean empty;
        private boolean unsorted;
        private boolean sorted;
        
        public SortInfo() {}
        
        public SortInfo(boolean empty, boolean unsorted, boolean sorted) {
            this.empty = empty;
            this.unsorted = unsorted;
            this.sorted = sorted;
        }
        
        // Getters and setters
        public boolean isEmpty() { return empty; }
        public void setEmpty(boolean empty) { this.empty = empty; }
        
        public boolean isUnsorted() { return unsorted; }
        public void setUnsorted(boolean unsorted) { this.unsorted = unsorted; }
        
        public boolean isSorted() { return sorted; }
        public void setSorted(boolean sorted) { this.sorted = sorted; }
    }
}
