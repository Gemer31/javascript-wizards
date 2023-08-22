import requestMessage, { requestMessageText } from '../ui/request-message';
import blackout from '../../blackout/blackout';
import InputEmail from '../../../shared/ui/input/input-email';
import appRouter from '../../../shared/lib/router/router';
import { Page } from '../../../shared/lib/router/pages';
import { IAddress } from '../../../entities/customer/models';
import CustomerAPI from '../../../entities/customer/api';
import apiFactory from '../../../shared/lib/api-factory';

interface IRequest {
  statusCode?: number;
  message?: string;
  customer?: { addresses: IAddress[] };
  id: string;
  version: number;
}

export const resultsCheckbox = {
  shipDefaultCheck: false,
  shipAsBillCheck: true,
  billDefaultCheck: false,
};

export async function resultCreateCustomer(request: IRequest, emailReg: InputEmail, password: HTMLInputElement) {
  const updateEmailReg = emailReg.getElement();
  if (request.customer) {
    localStorage.setItem('password', password.value);
    requestMessage.style.display = 'block';
    blackout.classList.add('blackout_show');
    requestMessageText.textContent = 'Account created successfully! 🎉';
    updateEmailReg.style.borderBottom = '';
    appRouter.navigate(Page.OVERVIEW);
  }
  if (request.statusCode) {
    if (request.message === 'There is already an existing api with the provided email.') {
      emailReg.alreadyExistMessage();
      updateEmailReg.classList.add('input_invalid');
    } else {
      requestMessage.style.display = 'block';
      requestMessageText.textContent = 'Something went wrong, try again later :)';
      blackout.classList.add('blackout_show');
    }
  }
}

export async function resultGetCustomer(id: string) {
  const customerAPI: CustomerAPI = apiFactory.getApi('customerAPI') as CustomerAPI;
  const request = await customerAPI.getById(id);
  const basicId: string = request.addresses[0].id;
  if (resultsCheckbox.shipDefaultCheck && !resultsCheckbox.shipAsBillCheck && !resultsCheckbox.billDefaultCheck) {
    await customerAPI.setDefaultAddress(request.id, request.version, [true, false], [basicId, '']);
  }

  if (resultsCheckbox.shipDefaultCheck && resultsCheckbox.shipAsBillCheck && !resultsCheckbox.billDefaultCheck) {
    await customerAPI.setDefaultAddress(request.id, request.version, [true, true], [basicId, basicId]);
  }

  if (resultsCheckbox.shipDefaultCheck && resultsCheckbox.billDefaultCheck && !resultsCheckbox.shipAsBillCheck) {
    await customerAPI.setDefaultAddress(request.id, request.version, [true, true], [basicId, request.addresses[1].id]);
  }

  if (resultsCheckbox.billDefaultCheck && !resultsCheckbox.shipDefaultCheck && !resultsCheckbox.shipAsBillCheck) {
    await customerAPI.setDefaultAddress(request.id, request.version, [false, true], ['', request.addresses[1].id]);
  }
}
