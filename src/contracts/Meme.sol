pragma solidity >=0.4.21 <0.6.0;



contract Meme {


    //Smart Contract 
    string memeHash;

    //write function
    function set(string memory _memeHash) public{ 
       
       memeHash = _memeHash;

    }
    //Read function 
    function get() public view returns(string memory){

      return memeHash;
    }


}