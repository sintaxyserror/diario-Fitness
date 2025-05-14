import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRutinaComponent } from './modal-rutina.component';

describe('ModalRutinaComponent', () => {
  let component: ModalRutinaComponent;
  let fixture: ComponentFixture<ModalRutinaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalRutinaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalRutinaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
