import { Injectable } from '@angular/core';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { tzip12, Tzip12Module } from '@taquito/tzip12';
import { tzip16 } from '@taquito/tzip16';
import { compose, TezosToolkit } from '@taquito/taquito';
import { NetworkType } from '@airgap/beacon-sdk';
import { BehaviorSubject } from 'rxjs';
import config from './app.config'

@Injectable({
  providedIn: 'root'
})
export class AppService {
  public tezos: TezosToolkit;
  public wallet: BeaconWallet;
  public isWalletConnected = new BehaviorSubject(false);
  public isTokenExists = new BehaviorSubject(false);
  constructor(
  ) { }

  public async checkToken(tezos: TezosToolkit): Promise<any> {
    const contract = await tezos.wallet.at(config.contractAddress,compose(tzip12,tzip16));
    contract.tzip12().getTokenMetadata(config.tokenId).then(() => {
      this.isTokenExists.next(true)
    })
        .catch((err) => {
          this.isTokenExists.next(false)
        });
  }

  public async createTezosUser(): Promise<TezosToolkit> {
    const tezos = await new TezosToolkit(config.rpcUrl);
    const tzip12Module = await new Tzip12Module();
    tezos.addExtension(tzip12Module)
    this.wallet = await new BeaconWallet({ name: config.walletName });
    await this.wallet.requestPermissions({
      network: {
        type: NetworkType.MAINNET,
      }
    })
    return tezos
  }

  public async connectWallet(): Promise<void> {
    this.tezos = await this.createTezosUser();
    this.tezos.setWalletProvider(this.wallet)
    this.isWalletConnected.next(true)
    await this.checkToken(this.tezos)
  }

  public disconnect(): void {
    this.wallet.disconnect()
        .then(()=> {
          this.isWalletConnected.next(false)
          this.isTokenExists.next(false)
        })
        .catch(err => console.log(err.message));
  }

  public checkConnection(): void {
    const account = localStorage.getItem('beacon:active-account')
    if(account){
      this.isWalletConnected.next(true);
      this.connectWallet();
    }else {
      this.isWalletConnected.next(false);
      this.isTokenExists.next(false)
    }
  }
}
