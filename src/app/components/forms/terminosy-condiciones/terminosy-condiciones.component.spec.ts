import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminosyCondicionesComponent } from './terminosy-condiciones.component';

describe('TerminosyCondicionesComponent', () => {
  let component: TerminosyCondicionesComponent;
  let fixture: ComponentFixture<TerminosyCondicionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerminosyCondicionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TerminosyCondicionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
