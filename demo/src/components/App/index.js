import React, { Component } from 'react'; 
// import fetch from 'isomorphic-fetch';
// import { sortBy } from 'lodash';
import './index..css'; 

import {
  DEFAULT_QUERY,
  DEFAULT_HPP,
  PATH_BASE,
  PATH_SEARCH,
  PARAM_SEARCH,
  PARAM_PAGE,
  PARAM_HPP
} from '../../constants';

import Button from '../Button';
import Search from '../Search';
import Table from '../Table';

const Loading = () =>
  <div> Loading ...</div>

const withLoading = (Component) => ({ isLoading, ...rest}) =>
  isLoading
  ? <Loading />
  : <Component { ...rest } />

const ButtonWithLoading = withLoading(Button);

const updateSearchTopStoriesState = (hits, page) => (prevState) => {
  const { searchKey, results } = prevState;
  const oldHits = results && results[searchKey]
    ? results[searchKey].hits
    : [];
  const updateHits = [
    ...oldHits,
    ...hits
  ];

  return {
    results: { 
      ...results,
      [searchKey]: { hits: updateHits, page }
    },
    isLoading: false 
  };
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
    };

    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.needToSearchTopStories = this.needToSearchTopStories.bind(this);
  }

  needToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  setSearchTopStories(result) {
    const { hits, page } = result;
    this.setState(updateSearchTopStoriesState(hits, page));
  }

  fetchSearchTopStories(searchTerm, page = 0) {
    this.setState({ isLoading: true });
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`) 
    .then(response => response.json()) 
    .then(result => this.setSearchTopStories(result)) 
    .catch(e => this.setState({ error: e }));
  }
  
  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const isNotID = item => item.objectID !== id;
    const updateHits = hits.filter(isNotID);

    this.setState({ 
      result: { 
        ...results, 
        [searchKey]: { hits: updateHits, page }
      } 
    });
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    if (this.needToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
    console.log(this.state.results);
    event.preventDefault();
  }

  componentDidMount() {
    const { searchTerm } = this.setState;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  render() {
    const {
      searchTerm, 
      results,
      searchKey,
      error,
      isLoading,
    } = this.state;

    const page = (
      results && 
      results[searchKey] &&
      results[searchKey].page
    ) || 0;

    const list = ( 
      results && 
      results[searchKey] && 
      results[searchKey].hits 
    ) || [];
    
    return ( 
    <div className="page">
      <div className="interactions">
        <Search 
          value={searchTerm}
          onChange={this.onSearchChange}
          onSubmit={this.onSearchSubmit}
        >
          Search
        </Search>
      </div>
        { error
          ? <div className="interactions">
              <p> Something went wrong.</p>
            </div>
          : <Table 
              list={list}
              ondismiss={this.ondismiss}
            />
        }
      <div className="interactions">
          <ButtonWithLoading 
            isLoading={isLoading}
            onClick={() => this.fetchSearchTopStories(searchKey, page+1)}>
            More
          </ButtonWithLoading>
      </div>
    </div> 
    );
  }  
}

export default App;