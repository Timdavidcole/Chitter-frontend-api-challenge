import React from 'react';
import './App.css';
import fetch from 'node-fetch';
import { CSSTransitionGroup } from 'react-transition-group';
import Menu from './Menu'


function App() {

    return (
      <div>
      <Chitter />
      </div>
    )

}

class Chitter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: false,
      list: 0
    };
  }

  callbackFunction = (user) => {
    this.setState({user: user},() => console.log(this.state.user))
  }

  changeList = (index) => {
    this.setState({list: index})
  }

  render() {
    return (
      <div>
        <Menu user={this.state.user} parentCallback = {this.callbackFunction} changeList={this.changeList}/>
        <Peeps list={this.state.list} user={this.state.user}/>
      </div>
    )
  }
}

class Peeps extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      peeps: [],
    };
    this.callbackFunction = this.callbackFunction.bind(this)
  }

  componentDidMount() {
    fetch('https://chitter-backend-api.herokuapp.com/peeps')
      .then(res => res.json())
      .then(json => this.setState({peeps: json}))
  }

  callbackFunction() {
    fetch('https://chitter-backend-api.herokuapp.com/peeps')
      .then(res => res.json())
      .then(json => this.setState({peeps: json}))
      .then(json => this.forceUpdate)
  }

  render() {
    if (this.props.list == 0) {
      return (
        <div className='Peep_List'>
          <PostNewPeep parentCallback = {this.callbackFunction} user ={this.props.user} />
          <CSSTransitionGroup
            transitionName="example"
            transitionEnterTimeout={500}
            transitionLeaveTimeout={300}>
            {this.state.peeps.map(function(peep, index){
              return <Peep parentCallback = {this.callbackFunction} user={this.props.user} peep={peep} key={peep.id} />;
            }, this)}
          </CSSTransitionGroup>
        </div>
      )
    } else {
      return (
        <div className='Peep_List'>
          <PostNewPeep parentCallback = {this.callbackFunction} user ={this.props.user} />
          <CSSTransitionGroup
            transitionName="example"
            transitionEnterTimeout={500}
            transitionLeaveTimeout={300}>
            {this.state.peeps.map(function(peep, index){
              if (peep.user.id === this.props.user.user_id) {
                return <Peep parentCallback = {this.callbackFunction} user={this.props.user} peep={peep} key={peep.id} />;
              }
            }, this)}
          </CSSTransitionGroup>
        </div>
      )
    }
  }
}

class Peep extends React.Component {
  constructor(props) {
    super(props);

    this.Peep = this.props.peep
    this.handleLike = this.handleLike.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.liked = this.liked.bind(this);
    this.state = {
      likes: this.Peep.likes.length,
      deleted: false
    };
  }

  handleLike(event) {
    event.preventDefault();
    fetch("https://chitter-backend-api.herokuapp.com/peeps/" + this.props.peep.id + "/likes/" + this.props.user.user_id, {
      method: 'PUT',
      headers: {"Authorization": "Token token=" + this.props.user.session_key }}).then(res => this.setState({likes: this.Peep.likes.length += 1 },() => console.log('success')))
  }

  handleDelete(event) {
    event.preventDefault();
    fetch("https://chitter-backend-api.herokuapp.com/peeps/" + this.props.peep.id, {
      method: 'DELETE',
      headers: {"Authorization": "Token token=" + this.props.user.session_key }})
      .then(json => this.setState({deleted: true}))
      .then(json => this.props.parentCallback)
  }

  liked() {
    if (this.Peep.likes.forEach(function(user){
      if (user.user_id === this.props.user.user_id){
        return true
      }}, this)) return 'PeepLikesTrue'
    else return 'PeepLikes'
  }

  render() {
    var date = new Date(this.Peep.created_at);
    return (
      <div className = 'Peep'>
        <p className = 'PeepHeader'>{this.Peep.user.handle}</p>
        <p>{this.Peep.body}</p>
        <div className="PeepDate">{date.getDate()}/{date.getMonth()}/{date.getYear()}</div>
        <div className={this.liked()} onClick={this.handleLike}>Likes: {this.state.likes}</div>
        <div className='DeletePeep' onClick={this.handleDelete}>Delete</div>
      </div>
    )
  }
}

class PostNewPeep extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      style: {background: '#d0f1f7', marginBottom: '30px'}
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    fetch("https://chitter-backend-api.herokuapp.com/peeps", {
      method: 'POST',
      headers: {'Content-Type': 'application/json', "Authorization": "Token token=" + this.props.user.session_key },
      body: JSON.stringify({"peep": {"user_id":this.props.user.user_id, "body":this.state.value}}),
    }).then(res => this.props.parentCallback())
      .then(res => this.setState({value: ''}))
      event.preventDefault();
  }

  render() {
    return (
      <div className = 'Peep' style = {this.state.style}>
        <header className = 'PeepHeader'>Post new peep
        </header>
        <form className = 'textbox' onSubmit={this.handleSubmit}>
          <label>
            <textarea value={this.state.value} onChange={this.handleChange} />
          </label>
        </form>
        <input className='Post_Peep' type="submit" value="Post Peep" />
      </div>
    );
  }
}

export default App;
