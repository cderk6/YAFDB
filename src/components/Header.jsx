import React, { Component } from 'react'
import SearchList from './SearchList.jsx'
import {Header as H} from 'semantic-ui-react'

export default class Header extends Component {
	constructor() {
		super()
	}

	render() {
		return(<div className='siteWrapper'>
			<H as='h1'> Yet Another Football Database </H>
			<div className='header' style={{
				height: '80px',
				paddingTop: '30px',
				borderBottom: 'black solid 8px'}}>
				<h2 style={{textAlign: 'left', fontSize: '30px', fontWeight: '700', paddingLeft: '80px'}}> Yet Another Football Database </h2>
			</div>

			<SearchList />
		</div>
		)
	}
}