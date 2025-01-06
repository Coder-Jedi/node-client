import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateBotComponent } from './create-bot.component';

const routes: Routes = [
  {
    path: '',
    component: CreateBotComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateBotRoutingModule { }
