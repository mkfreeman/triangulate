// Footer
import React, { Component } from 'react';
import './Footer.css';

class Footer extends Component {
    render() {
        return <footer>
                 <div class="footer-copyright">
                   <div class="container">
                     © 2017 Copyright <a href="http://mfviz.com/" target="_blank">Michael Freeman</a>
                     <a class="right" target="_blank" href="http://twitter.com/mf_viz">@mf_viz</a>
                   </div>
                 </div>
               </footer>
    }
}
export default Footer;