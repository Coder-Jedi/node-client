import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';


@NgModule({
  declarations: [
    MainComponent,
    SideNavComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
  ]
})
export class MainModule { }
