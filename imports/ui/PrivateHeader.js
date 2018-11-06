import {Accounts} from 'meteor/accounts-base';
import createHistory from 'history/createBrowserHistory';
import PropTypes from 'prop-types';
import React from 'react';

const PrivateHeader = (props) => {
  return (
    <div className='header'>
      <div className='header__content'>
        <h1 className='header__title'>{props.title}</h1>
        <button
          className='button__link button--link-text'
          onClick={() => {
            Accounts.logout();
            createHistory().replace('/');
          }
        }>Logout</button>
      </div>
    </div>
  );
};

export default PrivateHeader;

PrivateHeader.propTypes = {
  title: PropTypes.string.isRequired
};

