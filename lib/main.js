'use babel';

import { CompositeDisposable } from 'atom';
import configuration from './config';

import HTMLgenerator from './html_generator';
import RTFgenerator from './rtf_generator';
import copy from 'copy-paste';


export default {

  subscriptions: null,
  config: configuration,

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'copy-with-style:preset1': () => this.copy( 1 ),
      'copy-with-style:preset2': () => this.copy( 2 ),
      'copy-with-style:preset3': () => this.copy( 3 )
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  execute( cmd, input ){
      const { spawn } = require('child_process');
      const ls = spawn('python3', [cmd, input]);
      ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });
      ls.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });
      ls.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
      });
  },

  copy_to_clipboard( content ){
    return copy.copy( content );
  },

  copy_done( result ){
    atom.config.set('core.themes', ["one-dark-ui", "one-dark-syntax"])
    if( this.config.external_command === "" ){
      return this.copy_to_clipboard( result );
    } else {
      return this.execute( this.config.external_command, result );
    }
  },

  copy( preset ) {
    this.config = atom.config.get( 'copy-with-style.preset' + preset )
    atom.config.set('core.themes', ["one-light-ui","one-light-syntax"])
    if( this.config.format === "RTF" ){
      new RTFgenerator( this.config, this.copy_done.bind( this )).generate();
    } else {
      new HTMLgenerator( this.config, this.copy_done.bind( this )).generate();
    }
  }
};
