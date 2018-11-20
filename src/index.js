import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

function ListItem(props){
	return(
		<div class="list-item">
			<div class="item-details">
				<div class="first-line">
					<div>{props.cur}</div>
					{(props.value * props.nominal).toLocaleString(undefined, {maximumFractionDigits:4})}
				</div>
				<div class="second-line">
					XXX - ABCDEFGHIJK
				</div>
				<div class="third-line">
					1 USD = {props.cur} {props.value}
				</div>
			</div>

			<button onClick={props.onClick}>(-)</button>
		</div>
	);
}

function AddCurrencies(props){
	return(
		<div>
			<button onClick={props.onClick} style={props.addButtonStyle}>
				(+) Add More Currencies
			</button>

			<form onSubmit={props.onSubmit} style={props.submitStyle}>
				<select value={props.value} onChange={props.onChange}>
					{props.option}
				</select>
				<input type="submit" value="Submit"></input>
			</form>
		</div>
		);
}

class Forex extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			rates: [],
			shownIndex: [], //index of rates to be listed/shown
			unshownIndex: [], //index of unshown
			nominal: 1, //base value
			hideAddButton: false,
			value: 0
		}

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentWillMount() {
		fetch("https://api.exchangeratesapi.io/latest?base=USD")
		.then(results => {
			return results.json();
		}).then(
			(results) => {
				this.setState({
					rates: results.rates,
					unshownIndex: [...Array(Object.keys(results.rates).length).keys()],
				});
			}
		)
	}

	renderItems(i){
		//generate each selected currencies as in shownIndex
		return(
			<ListItem 
			onClick = {() => this.handleDelete(i)}
			cur = {Object.keys(this.state.rates)[i]}
			value = {Object.values(this.state.rates)[i]}
			nominal = {this.state.nominal}
			/>
		);

	}

	renderButton(){
		//handles addcurrency button 
		const addButtonStyle = this.state.hideAddButton ? {display: 'none'} : {};
		const submitStyle = this.state.hideAddButton ? {} :{display: 'none'};

		//options from select option tag
		const option = this.state.unshownIndex.map(i =>
				<option value={i}>{Object.keys(this.state.rates)[i]}</option>
			);

		return(
			<AddCurrencies 
			onClick = {() => this.handleClickAddButton()}
			addButtonStyle = {addButtonStyle}

			submitStyle = {submitStyle}
			option = {option}
			value = {this.state.value}
			onChange = {(event) => this.handleChange(event)}
			onSubmit = {(event) => this.handleSubmit(event)}
			/>
		);
	}

	handleChange(event){
		this.setState({value: event.target.value});
	}

	handleSubmit(event){
		//move the selected currency index from unshownIndex array to shownIndex array
		const unshownIndex = [...this.state.unshownIndex];
		const shownIndex = [...this.state.shownIndex];

		
		const index = unshownIndex.indexOf(this.state.value);
		unshownIndex.splice(index,1);
		shownIndex.push(this.state.value);
		
		this.setState({
			unshownIndex: unshownIndex,
			shownIndex: shownIndex,
			hideAddButton: false
		});
		event.preventDefault();
	}

	handleClickAddButton(){
		//hid addCurrency button, shows select option
		
		this.setState({
			hideAddButton: true,
			value: this.state.unshownIndex[0]
		});
	}

	handleDelete(i){
		//move selected currency's index from shownIndex to unshownIndex
		const shownIndex = [...this.state.shownIndex];
		const unshownIndex = [...this.state.unshownIndex];
		
		const index = shownIndex.indexOf(i);
		shownIndex.splice(index,1);
		unshownIndex.push(i);

		this.setState({
			shownIndex: shownIndex,
			unshownIndex: unshownIndex
		});
	}

	onBlur(event){
		//triggers after user loose focus 
		this.setState({nominal: event.target.value});
	}

	render() {
		//list of currencies to be shown
		const showLis = this.state.shownIndex.map(i =>
				<div>{this.renderItems(i)} </div>
			);
		//list of currencies currently not shown
		const option = this.state.unshownIndex.map(i =>
				<option value={i}>{Object.keys(this.state.rates)[i]}</option>
			);

		return (
			<div class="mainpage" align="center">
				<div class="main-header">
					<div class="header-firstline">USD-United States Dollar</div>
					<div class="header-secondline">
						<div>USD</div>
						<div><input class="nominal-input" type="text" pattern="[0-9]*" placeholder='1' onBlur={this.onBlur.bind(this)}/></div>
					</div>
				</div>
				{showLis}
				<div class="list-item">
					{this.renderButton()}
				</div>
				
			</div>			
		);
	}
}









ReactDOM.render(
	<Forex />, 
	document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
