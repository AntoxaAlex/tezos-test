import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy{

  public isTokenExists!: boolean;
  public isWalletSync: boolean = false;
  private walletSubscription$: Subscription;
  private tokenSubscription$: Subscription;
  constructor(private appService: AppService) {
  }

  ngOnInit() {
    this.appService.checkConnection();
    this.walletSubscription$ = this.appService.isWalletConnected.subscribe((isConnected: boolean) => {
      this.isWalletSync = isConnected;
    })
    this.tokenSubscription$ = this.appService.isTokenExists.subscribe((isTokenExists: boolean) => {
      this.isTokenExists = isTokenExists;
    })
  }

  ngOnDestroy() {
    this.walletSubscription$.unsubscribe();
  }

  public toggleSync(): void {
    if(!this.isWalletSync){
      this.appService.connectWallet()
    } else {
      this.appService.disconnect();
    }
  }
}
