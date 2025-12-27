import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSinistreComponent } from './create-sinistre.component';

describe('CreateSinistreComponent', () => {
  let component: CreateSinistreComponent;
  let fixture: ComponentFixture<CreateSinistreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSinistreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSinistreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
