<?php

namespace Justoverclock\UsersMapLocation\Listeners;

use Flarum\Api\Serializer\UserSerializer;
use Flarum\User\User;

class AddLocationAttribute
{
    public function __invoke(UserSerializer $serializer, User $user, array $attributes): array
    {
        $actor = $serializer->getActor();

        $attributes['location_city'] = $user->location_city;
        $attributes['location_postcode'] = $user->location_postcode;
        $attributes['location_countrycode'] = $user->location_countrycode;
        $attributes['location_country'] = $user->location_country;
        $attributes['location_longitude'] = $user->location_longitude;
        $attributes['location_latitude'] = $user->location_latitude;

        return $attributes;
    }
}
