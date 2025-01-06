import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateBotRoutingModule } from './create-bot-routing.module';
import { CreateBotComponent } from './create-bot.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    CreateBotComponent
  ],
  imports: [
    CommonModule,
    CreateBotRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class CreateBotModule { }
