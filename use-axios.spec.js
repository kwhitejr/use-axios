import { renderHook } from '@testing-library/react-hooks'
import nock from 'nock'
import useAxios from '../use-axios';

describe('useAxios', () => {
  const makeUrl = (id) => `https://pokeapi.co/api/v2/pokemon/${id}`;
  const makeNock = (id, name) => nock('https://pokeapi.co')
    .get(`/api/v2/pokemon/${id}`)
    .reply(200, { name })

  it('should return axios response', async () => {

    const urlCharizard = makeUrl(6);
    nock(6, 'charizard');
    // const urlBlastoise = makeUrl(9);
    // nock(9, 'blastoise')

    const { result, waitForNextUpdate } = renderHook(() => useAxios(urlCharizard));
    expect(result.current[0]).toMatchObject({
      isLoading: true,
      isError: false,
      data: undefined
    });

    await waitForNextUpdate();
    expect(result.current[0]).toMatchObject({
      isLoading: false,
      isError: false,
      response: {
        name: 'charizard'
      }
    });
  });
});