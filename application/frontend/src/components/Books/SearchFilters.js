import './SearchFilters.css'

function SearchFilters(props) {

    return (
        <div className='filtersDiv'>

            <h3>Filters:</h3>

            <label htmlFor='allOption'>No filters (default)</label>
            <input type='radio' id='allOption' name='readingOption'  onClick={() => props.updateFilter('all')}></input>

            <label htmlFor='booksOption'>Books</label>
            <input type='radio' id='booksOption' name='readingOption' onClick={() => props.updateFilter('books')}></input>

            <label htmlFor='magazinesOption'>Magazines</label>
            <input type='radio' id='magazinesOption' name='readingOption' onClick={() => props.updateFilter('magazines')}></input>
        </div>
    )
}

export default SearchFilters;