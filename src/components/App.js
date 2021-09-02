import React, { Component } from 'react';
import logo from '../logo.png';
import './App.css';
import Web3 from 'web3';
import Meme from '../abis/Meme.json';

const { create } = require('ipfs-http-client')
const ipfs = create ({ host:'ipfs.infura.io',port:'5001',protocol :'https'})

class App extends Component {



  async componentWillMount(){

    await this.loadWeb3()
    await this.loadBlockchainData()

  }


  //Get the account 
  //Get the network
  //Get the smartcontract
  //Get the memeHash

  //When we deploy smart contract we need two important things
  //-----> ABI:Meme.abi
  //----->Address:networkData.address

  async loadBlockchainData() {

    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0]})
    const networkId = await web3.eth.net.getId()
    console.log("Accounts",accounts)
    console.log("NetworkId",networkId)
    const networkData = Meme.networks[networkId]

    if(networkData) {

      //Fetch the contract

      const abi = Meme.abi
      const address = networkData.address
      const contract = web3.eth.Contract(abi,address)
      this.setState({contract})
      console.log(contract)
      const memeHash = await contract.methods.get().call()
      this.setState({memeHash})

    }else{

      window.alert('Smart Contract not deployed to detected network')
    }

  }


  constructor(props){

    super(props)
    this.state = {
      account:'',
      buffer: null,
      contract:null,
      memeHash:'QmVHxG72CaQXa94qKvGPEirrvWbC8CNhNnSvhaWTiMp6Yh'
    
    }
  }


  async loadWeb3(){

    if (window.ethereum){

      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    if (window.web3){
      window.web3 = new Web3(window.web3.currentProvider)

    }else{

       window.alert('Please use metamask')
    }

  }

  captureFile = (event)=>{

    event.preventDefault()
    console.log("file captured")
    //Process the file for IPFS
    console.log(event.target.files)
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend=()=>{
      this.setState({buffer:Buffer(reader.result)}) 
      console.log("buffer:",Buffer(reader.result))
    }
  }


  //Example hash=QmNRSV69QMcmS8XVy7aRFZxju6W2C6ErRwFFeaSg9i3YbL
  //Example url: https://ipfs.infura.io/ipfs/QmNRSV69QMcmS8XVy7aRFZxju6W2C6ErRwFFeaSg9i3YbL
  onSubmit = async (event) =>{

      event.preventDefault()
      console.log("Submitting the form")
      var data = this.state.buffer;
       if (data){
        try{
          const postResponse = await ipfs.add(data) 
          console.log("IPFS Result", postResponse);
          const memeHashresult = postResponse.path
          this.state.contract.methods.set(memeHashresult).send({from: this.state.account}).then((result)=>{
            this.setState({memeHash: memeHashresult})
          })
        } catch(e){
          console.log("Error: ", e)
        }
      } else{
        alert("No files submitted. Please try again.");
        console.log('ERROR: No data to submit');
      } 

      //Step 2: store file the blockchain

  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
              IPFS
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                <small className="text-white">{this.state.account}</small>

            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={`https://ipfs.infura.io/ipfs/${this.state.memeHash}`} className="App-logo" alt="logo" />
                </a>
                <br></br>
                <hr></hr>
                <h1>Welcome to IPFS</h1>
                <hr></hr>
                <form onSubmit={this.onSubmit}>
                  <input type='file' onChange={this.captureFile} ></input>
                  <input type="submit"></input>
                </form>
                </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
